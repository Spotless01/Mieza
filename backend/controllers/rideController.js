const mongoose = require("mongoose");
const Ride = require("../models/Ride");
const Settings = require("../models/Settings");
const RideDriver = require("../models/RideDriver");

function normalizeVehicleType(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (["taxi", "car", "cab"].includes(normalized)) return "taxi";
    if (["okada", "motorbike", "motorcycle", "bike"].includes(normalized)) return "okada";
    return normalized;
}

exports.requestRide = async (req, res) => {
    try {

        const {
            pickupLocation,
            destinationLocation,
            vehicleType,
            estimatedDistance,
            estimatedDuration
        } = req.body;

        // Customer identity comes from the verified JWT.
        const customerId = req.customerId;
        const normalizedVehicleType = normalizeVehicleType(vehicleType);

        if (
            !customerId ||
            !pickupLocation ||
            !destinationLocation ||
            !vehicleType ||
            !["taxi", "okada", "motorbike"].includes(normalizedVehicleType)
        ) {
            return res.status(400).json({
                message: "Missing required fields."
            });
        }

        // Load admin settings
        const settings = await Settings.findOne();

        const flatRideFee =
            settings?.rideFlatFee ?? 10;

        const perKmRate =
            settings?.ridePerKmRate ?? 2;

        const driverCommissionRate =
            settings?.riderCommissionRate ?? 10;

        // Calculate fare
        const rideFare = Number(
            (
                flatRideFee +
                (Number(estimatedDistance) * perKmRate)
            ).toFixed(2)
        );

        const driverCommission = Number(
            (
                rideFare *
                (driverCommissionRate / 100)
            ).toFixed(2)
        );

        const driverEarnings = Number(
            (
                rideFare -
                driverCommission
            ).toFixed(2)
        );

        const ride = await Ride.create({

            customerId,

            pickupLocation,

            destinationLocation,

            vehicleType: normalizedVehicleType,

            estimatedDistance:
                Number(estimatedDistance),

            estimatedDuration:
                Number(estimatedDuration),

            rideFare,

            driverCommission,

            driverEarnings,

            status: "searching"

        });

        res.status(201).json({

            message:
                "Ride request created.",

            ride

        });

    } catch (err) {

        console.log("Request Ride Error:", err);

        res.status(500).json({

            message:
                "Server error."

        });

    }
};


 // =====================================
 // GET CUSTOMER RIDE STATUS
 // =====================================

exports.getCustomerRideStatus = async (req, res) => {
    try {
        const customerId = req.customerId;
        const { rideId } = req.params;

        if (!mongoose.isValidObjectId(rideId)) {
            return res.status(400).json({
                message: "Invalid ride ID."
            });
        }

        const ride = await Ride.findOne({
            _id: rideId,
            customerId
        }).select(
            "customerId driverId pickupLocation destinationLocation vehicleType estimatedDistance estimatedDuration rideFare status createdAt updatedAt"
        ).populate({
            path: "driverId",
            select: "fullName phone profilePhoto vehicleType vehicleBrand vehicleModel vehicleColor plateNumber currentLocation"
        });

        if (!ride) {
            return res.status(404).json({
                message: "Ride not found."
            });
        }

        return res.status(200).json({ ride });

    } catch (err) {
        console.error("Get Customer Ride Status Error:", err);

        return res.status(500).json({
            message: "Failed to retrieve ride status."
        });
    }
};


exports.acceptRide = async (req, res) => {
    const session = await Ride.startSession();

    try {
        const { rideId } = req.params;
        const driverId = req.driverId;

        if (!driverId) {
            return res.status(401).json({
                message: "Driver authentication required."
            });
        }

        let acceptedRide = null;
        let failure = null;

        await session.withTransaction(async () => {
            acceptedRide = null;
            failure = null;

            const driver = await RideDriver.findById(driverId)
                .session(session);

            if (!driver) {
                failure = {
                    status: 401,
                    message: "Driver account not found."
                };
                return;
            }

            if (!driver.isApproved || !driver.isActive) {
                failure = {
                    status: 403,
                    message: "Driver account is not approved or active."
                };
                return;
            }

            // Atomically reserve an online, available driver.
            const reservedDriver = await RideDriver.findOneAndUpdate(
                {
                    _id: driverId,
                    isApproved: true,
                    isActive: true,
                    isOnline: true,
                    isAvailable: true
                },
                {
                    $set: { isAvailable: false }
                },
                {
                    new: true,
                    session
                }
            );

            if (!reservedDriver) {
                failure = {
                    status: 409,
                    message: "You are no longer available to accept a ride."
                };
                return;
            }

            // Claim only a fresh, unassigned ride of the matching type.
            const rideExpiryTime = new Date(
                Date.now() - 15 * 60 * 1000
            );

            const driverVehicleType = normalizeVehicleType(driver.vehicleType);
            const matchingVehicleTypes = driverVehicleType === "okada"
                ? ["okada", "motorbike"]
                : [driverVehicleType];

            acceptedRide = await Ride.findOneAndUpdate(
                {
                    _id: rideId,
                    status: "searching",
                    driverId: null,
                    vehicleType: { $in: matchingVehicleTypes },
                    createdAt: { $gte: rideExpiryTime }
                },
                {
                    $set: {
                        driverId,
                        status: "accepted",
                        "offeredTo.$[offer].acceptedAt": new Date()
                    }
                },
                {
                    returnDocument: "after",
                    session,
                    arrayFilters: [{ "offer.driverId": driver._id }]
                }
            ).populate({
                path: "customerId",
                select: "fullName phone profilePhoto",
                options: { session }
            });

            if (!acceptedRide) {
                failure = {
                    status: 409,
                    message:
                        "Ride is no longer available, has expired, or does not match your vehicle type."
                };

                // Returning without throwing aborts nothing automatically.
                // Throwing below ensures the driver reservation rolls back.
                throw Object.assign(
                    new Error(failure.message),
                    { rideAcceptanceFailure: failure }
                );
            }
        });

        if (failure) {
            return res.status(failure.status).json({
                message: failure.message
            });
        }

        if (!acceptedRide) {
            return res.status(409).json({
                message: "Ride could not be accepted."
            });
        }

        return res.status(200).json({
            message: "Ride accepted successfully.",
            ride: acceptedRide
        });

    } catch (error) {
        if (error.rideAcceptanceFailure) {
            return res.status(error.rideAcceptanceFailure.status).json({
                message: error.rideAcceptanceFailure.message
            });
        }

        console.error("Accept Ride Transaction Error:", error);

        return res.status(500).json({
            message: "Unable to accept ride. Please try again."
        });

    } finally {
        await session.endSession();
    }
};




exports.markDriverArrived = async (req, res) => {
    try {
        const { rideId } = req.params;
        const driverId = req.driverId;

        if (!driverId) {
            return res.status(401).json({
                message: "Driver authentication required."
            });
        }

        const ride = await Ride.findOneAndUpdate(
            {
                _id: rideId,
                driverId: driverId,
                status: "accepted"
            },
            {
                $set: {
                    status: "arrived"
                }
            },
            {
                new: true
            }
        ).populate(
            "customerId",
            "fullName phone profilePhoto"
        );

        if (!ride) {
            return res.status(404).json({
                message:
                    "Ride not found, not assigned to you, or is not in accepted status."
            });
        }

        return res.status(200).json({
            message: "Driver has arrived at the pickup location.",
            ride
        });

    } catch (error) {
        console.error("Mark Driver Arrived Error:", error);

        return res.status(500).json({
            message: "Server error."
        });
    }
};

exports.startRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const driverId = req.driverId;

        if (!driverId) {
            return res.status(401).json({
                message: "Driver authentication required."
            });
        }

        const ride = await Ride.findOneAndUpdate(
            {
                _id: rideId,
                driverId: driverId,
                status: "arrived"
            },
            {
                $set: {
                    status: "ongoing"
                }
            },
            {
                new: true
            }
        ).populate(
            "customerId",
            "fullName phone profilePhoto"
        );

        if (!ride) {
            return res.status(404).json({
                message:
                    "Ride not found, not assigned to you, or is not in arrived status."
            });
        }

        return res.status(200).json({
            message: "Ride started successfully.",
            ride
        });

    } catch (error) {
        console.error("Start Ride Error:", error);

        return res.status(500).json({
            message: "Server error."
        });
    }
};


exports.completeRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const driverId = req.driverId;

        if (!driverId) {
            return res.status(401).json({
                message: "Driver authentication required."
            });
        }

        const ride = await Ride.findOneAndUpdate(
            {
                _id: rideId,
                driverId: driverId,
                status: "ongoing"
            },
            {
                $set: {
                    status: "completed"
                }
            },
            {
                new: true
            }
        ).populate(
            "customerId",
            "fullName phone profilePhoto"
        );

        if (!ride) {
            return res.status(404).json({
                message:
                    "Ride not found, not assigned to you, or is not ongoing."
            });
        }

        await RideDriver.findByIdAndUpdate(
    driverId,
    {
        $set: {
            isAvailable: true
        }
    }
);

        return res.status(200).json({
            message: "Ride completed successfully.",
            ride
        });

    } catch (error) {
        console.error("Complete Ride Error:", error);

        return res.status(500).json({
            message: "Server error."
        });
    }
};

// Customer cancellation is separate from driver cancellation so a customer
// token can never be used to invoke the driver-only endpoint.
exports.cancelCustomerRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const customerId = req.customerId;

        if (!customerId) {
            return res.status(401).json({
                message: "Customer authentication required."
            });
        }

        if (!mongoose.isValidObjectId(rideId)) {
            return res.status(400).json({
                message: "Invalid ride ID."
            });
        }

        // Customers may cancel while a driver is being found or before the
        // trip starts. An ongoing or completed trip cannot be cancelled here.
        const ride = await Ride.findOneAndUpdate(
            {
                _id: rideId,
                customerId,
                status: { $in: ["searching", "accepted", "arrived"] }
            },
            { $set: { status: "cancelled" } },
            { new: true }
        );

        if (!ride) {
            return res.status(409).json({
                message: "This ride could not be cancelled. It may already be cancelled, completed, or in progress."
            });
        }

        // If a driver had accepted the ride, release them for another request.
        if (ride.driverId) {
            await RideDriver.findByIdAndUpdate(ride.driverId, {
                $set: { isAvailable: true }
            });
        }

        return res.status(200).json({
            message: "Ride cancelled successfully.",
            ride
        });
    } catch (error) {
        console.error("Customer Cancel Ride Error:", error);
        return res.status(500).json({
            message: "Unable to cancel this ride right now. Please try again."
        });
    }
};


exports.cancelRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const driverId = req.driverId;

        if (!driverId) {
            return res.status(401).json({
                message: "Driver authentication required."
            });
        }

        const ride = await Ride.findOneAndUpdate(
            {
                _id: rideId,
                driverId: driverId,
                status: {
                    $in: ["accepted", "arrived", "ongoing"]
                }
            },
            {
                $set: {
                    status: "cancelled"
                }
            },
            {
                new: true
            }
        ).populate(
            "customerId",
            "fullName phone profilePhoto"
        );

        if (!ride) {
            return res.status(404).json({
                message:
                    "Ride not found, not assigned to you, or cannot be cancelled at this stage."
            });
        }

        await RideDriver.findByIdAndUpdate(
    driverId,
    {
        $set: {
            isAvailable: true
        }
    }
);

        return res.status(200).json({
            message: "Ride cancelled successfully.",
            ride
        });

    } catch (error) {
        console.error("Cancel Ride Error:", error);

        return res.status(500).json({
            message: "Server error."
        });
    }
};