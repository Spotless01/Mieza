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

        const driver = await RideDriver.findOne({
            email: email.trim().toLowerCase()
        });

        if (!driver) {

            return res.status(400).json({
                message: "Invalid email or password."
            });

        }

        const passwordCorrect =
            await bcrypt.compare(
                password,
                driver.password
            );

        if (!passwordCorrect) {

            return res.status(400).json({
                message: "Invalid email or password."
            });

        }

        if (!driver.isApproved) {

            return res.status(403).json({
                message:
                "Your account is still waiting for approval."
            });

        }

        if (!driver.isActive) {

            return res.status(403).json({
                message:
                "Your account has been suspended."
            });

        }

        const token =
            jwt.sign(

                {

                    id: driver._id,
                    role: "rideDriver"

                },

                process.env.JWT_SECRET,

                {

                    expiresIn: "30d"

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

                isAvailable: driver.isAvailable

            }

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

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