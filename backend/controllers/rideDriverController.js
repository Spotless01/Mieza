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

        console.log(driver);

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