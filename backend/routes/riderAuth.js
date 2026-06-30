const express =
require("express");

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");

const Rider =
require("../models/Rider");

const router =
express.Router();

const Settings =
require("../models/Settings");


// ======================
// REGISTER RIDER
// ======================

router.post(
"/register",
async (req, res) => {

try {

const {

fullName,

phone,

email,

password,

vehicleType,

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

} = req.body;

const existingRider =
await Rider.findOne({
email
});

if (existingRider) {

return res.status(400)
.json({
message:
"Rider already exists"
});

}

const settings =
  await Settings.findOne();

const riderRegistrationFee =
  settings?.riderRegistrationFee ?? 100;

const riderPaymentRequired =
  settings?.riderRegistrationPaymentRequired ?? true;

if (
  riderPaymentRequired &&
  !paymentReference
) {

  return res.status(400).json({
    message:
      "Rider registration payment is required"
  });

}

const rider =
new Rider({

fullName,

phone,

email:
email.trim().toLowerCase(),

password,

vehicleType,

registrationFee:
  riderPaymentRequired
    ? riderRegistrationFee
    : 0,

paystackReference:
paymentReference || `FREE_RIDER_${Date.now()}_${Math.floor(Math.random() * 100000)}`,

isApproved:
false,

isActive:
true,

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

await rider.save();

res.json({

message:
"Rider registered successfully. Awaiting admin approval."

});

}

catch (err) {

console.log(err);

res.status(500).json({

message:
"Server error"

});

}

}
);




// ======================
// LOGIN RIDER
// ======================

router.post(
"/login",
async (req, res) => {

try {

const {

email,

password

} = req.body;

const rider =
await Rider.findOne({
  email:
    email.trim().toLowerCase()
});

console.log(
  "RIDER LOGIN CHECK:",
  rider?.email,
  "approved:",
  rider?.isApproved,
  "active:",
  rider?.isActive
);

if (!rider) {

return res.status(400)
.json({

message:
"Invalid credentials"

});

}

const match =
await bcrypt.compare(

password,

rider.password

);

if (!match) {

return res.status(400)
.json({

message:
"Invalid credentials"

});

}

if (!rider.isApproved) {

return res.status(403)
.json({

message:
"Your rider account is awaiting admin approval."

});

}

if (!rider.isActive) {

return res.status(403)
.json({

message:
"Your rider account has been suspended."

});

}

const token =
jwt.sign(

{
riderId:
rider._id
},

process.env.JWT_SECRET,

{
expiresIn: "7d"
}

);

const riderData = {

  _id: rider._id,

  fullName: rider.fullName,

  phone: rider.phone,

  email: rider.email,

  vehicleType: rider.vehicleType,

  isAvailable: rider.isAvailable,

  isApproved: rider.isApproved,

isActive: rider.isActive,

};

res.json({

  token,

  rider: riderData

});

}

catch (err) {

console.log(err);

res.status(500).json({

message:
"Server error"

});

}

}
);

module.exports =
router;