const Ride = require("../models/Ride");
const Settings = require("../models/Settings");

exports.requestRide = async (req, res) => {

    try {

        const {

            customerId,

            pickupLocation,

            destinationLocation,

            vehicleType,

            estimatedDistance,

            estimatedDuration

        } = req.body;

        if (
            !customerId ||
            !pickupLocation ||
            !destinationLocation ||
            !vehicleType
        ) {

            return res.status(400).json({
                message: "Missing required fields."
            });

        }

        // Load admin settings

        const settings =
        await Settings.findOne();

        const flatRideFee =
        settings?.rideFlatFee ?? 10;

        const perKmRate =
        settings?.ridePerKmRate ?? 2;

        const driverCommissionRate =
        settings?.riderCommissionRate ?? 10;

        // Calculate fare

        const rideFare =
        Number(
            (
                flatRideFee +
                (estimatedDistance * perKmRate)
            ).toFixed(2)
        );

        const driverCommission =
        Number(
            (
                rideFare *
                (driverCommissionRate / 100)
            ).toFixed(2)
        );

        const driverEarnings =
        Number(
            (
                rideFare -
                driverCommission
            ).toFixed(2)
        );

        const ride =
        await Ride.create({

            customerId,

            pickupLocation,

            destinationLocation,

            vehicleType,

            estimatedDistance,

            estimatedDuration,

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

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:
            "Server error."

        });

    }

};