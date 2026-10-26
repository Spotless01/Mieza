const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const RideDriver = require("../models/RideDriver");
const Notification = require("../models/Notification");
const Admin = require("../models/Admin");
const Settings = require("../models/Settings");

const sendEmail = require("../config/brevo");
const sendSMS = require("../config/sms");
const createPaystackSubaccount = require("../config/paystackSubaccounts");


exports.registerRideDriver = async (req,res)=>{

try{

const{

fullName,
email,
phone,
password,

vehicleType,
vehicleBrand,
vehicleModel,
vehicleColor,

plateNumber,
driverLicenseNumber,
nationalIdNumber,

payoutMethod,

momoNumber,
momoName,
momoNetwork,
momoBankCode,

bankName,
bankCode,
accountName,
accountNumber,

paymentReference

}=req.body;

const profilePhoto =
req.files?.profilePhoto?.[0]?.path || "";

const vehiclePhotos =
(req.files?.vehiclePhotos || [])
.map(file=>file.path);

const existing =
await RideDriver.findOne({
email
});

if(existing){

return res.status(400).json({
message:"Driver already exists."
});

}

const settings =
await Settings.findOne();

const fee =
settings?.rideDriverRegistrationFee ?? 100;

const paymentRequired =
settings?.rideDriverRegistrationPaymentRequired ?? true;

if(paymentRequired && !paymentReference){

return res.status(400).json({
message:"Registration payment required."
});

}

const driver =
new RideDriver({

fullName,

email:
email.trim().toLowerCase(),

phone,
password,

profilePhoto,

currentLocation:{

address:req.body.currentLocation,

latitude:req.body.latitude,

longitude:req.body.longitude

},

vehicleType,
vehicleBrand,
vehicleModel,
vehicleColor,

plateNumber,

vehiclePhotos,

driverLicenseNumber,
nationalIdNumber,

registrationFee:
paymentRequired ? fee : 0,

paystackReference:
paymentReference ||
`FREE_DRIVER_${Date.now()}`,

payoutMethod,

momoNumber,
momoName,
momoNetwork,
momoBankCode,

bankName,
bankCode,
accountName,
accountNumber

});

if (settings?.paymentProvider === "paystack") {

    try {

        const recipient =
            await createPaystackSubaccount(driver);

        driver.paystackRecipientCode =
            recipient;

    } catch (err) {

        console.log(
            "Paystack recipient creation failed:",
            err.message
        );

    }

}

await driver.save();

await Notification.create({

    title: "New Ride Driver Registration",

    message:
`${driver.fullName} is waiting for approval.`

});

// =====================================
// EMAIL ALL ADMINS
// =====================================

try {

    const admins = await Admin.find({
        isActive: true,
        role: {
            $in: ["owner", "cofounder"]
        }
    }).select("name email role");

    await Promise.allSettled(

        admins.map(admin =>

            sendEmail(

                admin.email,

                "New Ride Driver Waiting For Approval - Mieza",

                `
                <h2>New Ride Driver Registration</h2>

                <p>Hello ${admin.name},</p>

                <p>
                A new ride driver has registered on Mieza
                and is waiting for approval.
                </p>

                <hr>

                <p><strong>Name:</strong> ${driver.fullName}</p>
                <p><strong>Email:</strong> ${driver.email}</p>
                <p><strong>Phone:</strong> ${driver.phone}</p>
                <p><strong>Vehicle:</strong> ${driver.vehicleBrand} ${driver.vehicleModel}</p>
                <p><strong>Plate Number:</strong> ${driver.plateNumber}</p>

                <br>

                <a
                href="https://miezadelivery.com/admin-login.html"
                style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#0b5cff;
                    color:white;
                    text-decoration:none;
                    border-radius:8px;
                ">
                Open Admin Dashboard
                </a>

                `
            )

        )

    );

} catch(err){

    console.log(
        "Ride Driver admin email failed:",
        err
    );

}

try{

    const adminsWithPhone =
    await Admin.find({

        isActive:true,

        role:{
            $in:["owner","cofounder"]
        },

        phone:{
            $exists:true,
            $ne:""
        }

    }).select("phone");

    await Promise.allSettled(

        adminsWithPhone.map(admin=>

            sendSMS(

                admin.phone,

`MIEZA ADMIN

New ride driver awaiting approval.

Driver:
${driver.fullName}

Vehicle:
${driver.vehicleBrand} ${driver.vehicleModel}

Plate:
${driver.plateNumber}

Login to the admin dashboard to review.

miezadelivery.com/admin-login.html`

            )

        )

    );

}catch(err){

    console.log(
        "Ride Driver SMS failed:",
        err.message
    );

}

return res.status(201).json({

    message:"Ride driver registered successfully.",

    driver

});

}catch(err){

    console.log(err);

    res.status(500).json({

        message:err.message

    });

}

};

// =====================================
// DRIVER LOGIN
// =====================================

exports.loginRideDriver = async (req, res) => {

    try {

        const { email, password } = req.body;

        const driver =
        await RideDriver.findOne({

            email: email.trim().toLowerCase()

        });

        if (!driver) {

            return res.status(400).json({

                message: "Invalid email or password."

            });

        }

        const passwordMatches =
        await bcrypt.compare(

            password,
            driver.password

        );

        if (!passwordMatches) {

            return res.status(400).json({

                message: "Invalid email or password."

            });

        }

        if (!driver.isApproved) {

            return res.status(403).json({

                message:
                "Your account is awaiting approval."

            });

        }

        if (!driver.isActive) {
    return res.status(403).json({
        message: "Your account has been suspended."
    });
}

        const token =
        jwt.sign(

            {

                rideDriverId: driver._id

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

        res.json({

            token,

            driver: {

                _id: driver._id,

                fullName: driver.fullName,

                email: driver.email,

                phone: driver.phone,

                vehicleType: driver.vehicleType,

                isApproved: driver.isApproved,

                isAvailable: driver.isAvailable,

                isOnline: driver.isOnline,

                walletBalance: driver.walletBalance,

                averageRating: driver.averageRating,

                totalTrips: driver.totalTrips

            }

        });

    }

    catch (err) {

        console.error("Ride Driver Login Error:");
console.error(err);

        res.status(500).json({

            message: "Login failed."

        });

    }

};



 // =====================================
 // GET LOGGED-IN DRIVER PROFILE
 // =====================================

exports.getMyProfile = async (req, res) => {
    try {
        const driver = req.rideDriver;

        if (!driver) {
            return res.status(404).json({
                message: "Driver profile not found."
            });
        }

        // Calculate dashboard statistics from completed rides rather than
        // relying on counters that the existing completion flow never updates.
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [completedStatsResult, terminalStatsResult] = await Promise.all([
            Ride.aggregate([
                {
                    $match: {
                        driverId: driver._id,
                        status: "completed"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTrips: { $sum: 1 },
                        totalEarnings: {
                            $sum: { $ifNull: ["$driverEarnings", 0] }
                        },
                        todayTrips: {
                            $sum: {
                                $cond: [
                                    { $gte: ["$updatedAt", todayStart] },
                                    1,
                                    0
                                ]
                            }
                        },
                        todayEarnings: {
                            $sum: {
                                $cond: [
                                    { $gte: ["$updatedAt", todayStart] },
                                    { $ifNull: ["$driverEarnings", 0] },
                                    0
                                ]
                            }
                        }
                    }
                }
            ]),
            Ride.aggregate([
                {
                    $match: {
                        driverId: driver._id,
                        status: { $in: ["completed", "cancelled"] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        completed: {
                            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                        },
                        cancelled: {
                            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                        }
                    }
                }
            ])
        ]);

        const completedStats = completedStatsResult[0] || {
            totalTrips: 0,
            totalEarnings: 0,
            todayTrips: 0,
            todayEarnings: 0
        };
        const terminalStats = terminalStatsResult[0] || {
            completed: 0,
            cancelled: 0
        };
        const terminalRideCount = terminalStats.completed + terminalStats.cancelled;
        const completionRate = terminalRideCount > 0
            ? Math.round((terminalStats.completed / terminalRideCount) * 100)
            : null;

        // Offers are recorded once per driver/ride when the dashboard retrieves them.
        const offerStatsResult = await Ride.aggregate([
            { $unwind: "$offeredTo" },
            { $match: { "offeredTo.driverId": driver._id } },
            {
                $group: {
                    _id: null,
                    offers: { $sum: 1 },
                    accepted: {
                        $sum: {
                            $cond: [
                                { $ne: [{ $ifNull: ["$offeredTo.acceptedAt", null] }, null] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);
        const offerStats = offerStatsResult[0] || { offers: 0, accepted: 0 };
        const acceptanceRate = offerStats.offers > 0
            ? Math.round((offerStats.accepted / offerStats.offers) * 100)
            : null;

        return res.json({
            driver: {
                _id: driver._id,
                fullName: driver.fullName,
                email: driver.email,
                phone: driver.phone,
                vehicleType: driver.vehicleType,
                vehicleBrand: driver.vehicleBrand,
                vehicleModel: driver.vehicleModel,
                vehicleColor: driver.vehicleColor,
                plateNumber: driver.plateNumber,
                currentLocation: driver.currentLocation,
                isApproved: driver.isApproved,
                isActive: driver.isActive,
                isAvailable: driver.isAvailable,
                isOnline: driver.isOnline,
                // Wallet balance remains the separately stored wallet amount.
                // Ride earnings are calculated from completed rides below.
                walletBalance: Number(driver.walletBalance || 0),
                averageRating: driver.averageRating,
                totalTrips: completedStats.totalTrips,
                todayTrips: completedStats.todayTrips,
                todayEarnings: Number(completedStats.todayEarnings || 0),
                totalEarnings: Number(completedStats.totalEarnings || 0),
                acceptanceRate,
                completionRate
            }
        });
    } catch (err) {
        console.error("Get Driver Profile Error:", err);

        return res.status(500).json({
            message: "Failed to retrieve driver profile."
        });
    }
};


// =====================================
// UPDATE LOGGED-IN DRIVER'S GPS LOCATION
// =====================================
exports.updateMyLocation = async (req, res) => {
    try {
        const latitude = Number(req.body.latitude);
        const longitude = Number(req.body.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ message: "A valid latitude and longitude are required." });
        }

        const driver = await RideDriver.findByIdAndUpdate(
            req.driverId,
            { $set: {
                "currentLocation.latitude": latitude,
                "currentLocation.longitude": longitude
            } },
            { returnDocument: "after", runValidators: true }
        ).select("-password");

        if (!driver) return res.status(404).json({ message: "Driver profile not found." });
        return res.json({
            message: "GPS coordinates saved successfully.",
            currentLocation: driver.currentLocation
        });
    } catch (error) {
        console.error("Update Driver Location Error:", error);
        return res.status(500).json({ message: "Failed to update driver location." });
    }
};

// =====================================
// UPDATE ALLOWED DRIVER PROFILE FIELDS
// =====================================
exports.updateMyProfile = async (req, res) => {
    try {
        const allowedFields = ["fullName", "email", "phone", "vehicleBrand", "vehicleModel", "vehicleColor", "plateNumber"];
        const updates = {};

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                if (typeof req.body[field] !== "string" || !req.body[field].trim()) {
                    return res.status(400).json({ message: `${field} must not be empty.` });
                }
                updates[field] = req.body[field].trim();
            }
        }

        if (Object.prototype.hasOwnProperty.call(updates, "email")) {
            updates.email = updates.email.toLowerCase();
            const duplicate = await RideDriver.findOne({ email: updates.email, _id: { $ne: req.driverId } });
            if (duplicate) return res.status(409).json({ message: "That email address is already used by another driver." });
        }

        if (!Object.keys(updates).length) {
            return res.status(400).json({ message: "No editable profile fields were provided." });
        }

        const driver = await RideDriver.findByIdAndUpdate(
            req.driverId,
            { $set: updates },
            { returnDocument: "after", runValidators: true }
        ).select("-password -nationalIdNumber -driverLicenseNumber");

        if (!driver) return res.status(404).json({ message: "Driver profile not found." });
        return res.json({ message: "Profile updated successfully.", driver });
    } catch (error) {
        if (error && error.code === 11000) {
            return res.status(409).json({ message: "That email address is already in use." });
        }
        console.error("Update Driver Profile Error:", error);
        return res.status(500).json({ message: "Failed to update driver profile." });
    }
};

// ====================================
// TOGGLE DRIVER AVAILABILITY
// ====================================

exports.toggleAvailability =
async(req,res)=>{

try{

const driver =
await RideDriver.findById(
req.driverId
);

if(!driver){

return res.status(404).json({
message:"Driver not found."
});

}

driver.isOnline =
!driver.isOnline;

driver.isAvailable =
driver.isOnline;

await driver.save();

res.json({

message:
driver.isOnline
? "Driver is now online."
: "Driver is now offline.",

isOnline:
driver.isOnline,

isAvailable:
driver.isAvailable

});

}

catch(err){

res.status(500).json({
message:err.message
});

}

};

// =====================================
// GET ALL RIDE DRIVERS (ADMIN)
// =====================================

exports.getAllRideDrivers = async (req, res) => {

    try {

        const drivers =
        await RideDriver.find()
        .sort({ createdAt: -1 });

        res.json(drivers);

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Unable to load ride drivers."

        });

    }

};

// =====================================
// APPROVE RIDE DRIVER
// =====================================

exports.approveRideDriver = async (req, res) => {

    try {

        const driver =
        await RideDriver.findById(req.params.id);

        if(!driver){

            return res.status(404).json({
                message:"Ride driver not found."
            });

        }

        driver.isApproved = true;
        driver.isActive = true;
        driver.isOnline = false;
        driver.isAvailable = false;
        driver.status = "approved";
        driver.approvedAt = new Date();

        await driver.save();

        // Notify driver inside app
        await Notification.create({

            userId: driver._id,

            userType: "rideDriver",

            title: "Registration Approved",

            message:
            "Congratulations! Your Mieza Ride Driver account has been approved. You can now log in and start accepting ride requests."

        });

        // Email driver
        try{

            await sendEmail(

                driver.email,

                "Your Mieza Ride Driver Account Has Been Approved",

                `
                <h2>Congratulations ${driver.fullName} 🎉</h2>

                <p>Your Mieza Ride Driver account has been approved.</p>

                <p>You can now log in and start accepting ride requests.</p>

                <br>

                <a href="https://miezadelivery.com/ride-driver-login.html"
                style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#0b5cff;
                    color:white;
                    text-decoration:none;
                    border-radius:8px;
                ">
                Driver Login
                </a>
                `
            );

        }catch(err){

            console.log("Ride driver approval email failed:", err.message);

        }

        // SMS driver
        try{

            await sendSMS(

                driver.phone,

`MIEZA

Congratulations!

Your Ride Driver account has been approved.

You can now log in and begin accepting ride requests.

miezadelivery.com`

            );

        }catch(err){

            console.log("Ride driver approval SMS failed:", err.message);

        }

        res.json({

            message:"Ride driver approved successfully."

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Unable to approve ride driver."

        });

    }

};

// =====================================
// SUSPEND RIDE DRIVER
// =====================================

exports.suspendRideDriver = async (req, res) => {

    try {

        const driver =
        await RideDriver.findById(req.params.id);

        if(!driver){

            return res.status(404).json({
                message:"Ride driver not found."
            });

        }

        driver.isApproved = false;
        driver.isOnline = false;
        driver.isAvailable = false;
        driver.status = "suspended";

        await driver.save();

        await Notification.create({

            userId: driver._id,

            userType: "rideDriver",

            title: "Account Suspended",

            message:
            "Your Ride Driver account has been suspended. Please contact Mieza Support for assistance."

        });

        res.json({

            message:"Ride driver suspended successfully."

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Unable to suspend ride driver."

        });

    }

};


// =====================================
// DELETE RIDE DRIVER
// =====================================

exports.deleteRideDriver = async (req, res) => {

    try {

        const driver =
        await RideDriver.findById(req.params.id);

        if(!driver){

            return res.status(404).json({
                message:"Ride driver not found."
            });

        }

        await RideDriver.findByIdAndDelete(req.params.id);

        res.json({

            message:"Ride driver deleted successfully."

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Unable to delete ride driver."

        });

    }

};


// =====================================
// GET SINGLE RIDE DRIVER
// =====================================

exports.getRideDriverById = async (req, res) => {

    try {

        const driver =
        await RideDriver.findById(req.params.id);

        if(!driver){

            return res.status(404).json({

                message:"Ride driver not found."

            });

        }

        res.json(driver);

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            message:"Unable to load ride driver."

        });

    }

};


const Ride = require("../models/Ride");


exports.getActiveRideStatus = async (req, res) => {
    try {
        const driverId = req.driverId;
        const { rideId } = req.params;
        if (!driverId) return res.status(401).json({ message: "Driver authentication required." });
        if (!mongoose.isValidObjectId(rideId)) return res.status(400).json({ message: "Invalid ride ID." });

        const ride = await Ride.findOne({ _id: rideId, driverId })
            .select("customerId driverId pickupLocation destinationLocation vehicleType estimatedDistance estimatedDuration rideFare status createdAt updatedAt")
            .populate("customerId", "fullName phone profilePhoto");

        if (!ride) return res.status(404).json({ message: "Ride not found for this driver." });
        return res.status(200).json({ ride });
    } catch (error) {
        console.error("Get Driver Ride Status Error:", error);
        return res.status(500).json({ message: "Unable to retrieve ride status." });
    }
};

exports.getAvailableRides = async (req, res) => {
    try {
        const driver = req.rideDriver;

        if (!driver) {
            return res.status(401).json({
                message: "Driver account not found."
            });
        }

        if (!driver.isApproved) {
            return res.status(403).json({
                message: "Driver account is not approved."
            });
        }

        if (!driver.isActive) {
            return res.status(403).json({
                message: "Driver account is inactive."
            });
        }

        if (!driver.isOnline || !driver.isAvailable) {
            return res.status(403).json({
                message: "Driver must be online and available."
            });
        }

        const rideExpiryTime = new Date(
            Date.now() - 15 * 60 * 1000
        );

        await Ride.updateMany(
            {
                status: "searching",
                createdAt: { $lt: rideExpiryTime }
            },
            {
                $set: { status: "expired" }
            }
        );

        // Before acceptance, return only ride and route details. Do not expose
        // customer identity or phone numbers to every driver browsing requests.
        const rawVehicleType = String(driver.vehicleType || "").trim().toLowerCase();
        const driverVehicleType = ["motorbike", "motorcycle", "bike", "okada"].includes(rawVehicleType)
            ? "okada"
            : rawVehicleType;
        const matchingVehicleTypes = driverVehicleType === "okada"
            ? ["okada", "motorbike"]
            : [driverVehicleType];

        const rides = await Ride.find({
            status: "searching",
            driverId: null,
            vehicleType: { $in: matchingVehicleTypes },
            createdAt: { $gte: rideExpiryTime }
        })
            .select("customerId pickupLocation destinationLocation vehicleType estimatedDistance estimatedDuration rideFare status createdAt")
            .populate("customerId", "fullName")
            .sort({ createdAt: 1 });

        // A repeated dashboard poll must not inflate the offer denominator.
        // Record each ride once for this driver, only while the ride is still searching.
        if (rides.length) {
            await Promise.all(rides.map(ride => Ride.updateOne(
                {
                    _id: ride._id,
                    status: "searching",
                    offeredTo: { $not: { $elemMatch: { driverId: driver._id } } }
                },
                { $push: { offeredTo: { driverId: driver._id, offeredAt: new Date(), acceptedAt: null } } }
            )));
        }

        return res.status(200).json({
            count: rides.length,
            rides
        });

    } catch (error) {
        console.error(
            "Get Available Rides Error:",
            error
        );

        return res.status(500).json({
            message: "Server error."
        });
    }
};
