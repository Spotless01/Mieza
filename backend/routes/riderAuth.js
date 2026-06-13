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

vehicleType

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

const rider =
new Rider({

fullName,

phone,

email,

password,

vehicleType

});

await rider.save();

res.json({

message:
"Rider registered successfully"

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
email
});

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

res.json({

token,

rider

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