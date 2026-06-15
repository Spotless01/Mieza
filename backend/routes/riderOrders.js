const riderAuthMiddleware =
require("../middleware/riderAuthMiddleware");

const express =
require("express");

const Order =
require("../models/Order");

const Rider =
require("../models/Rider");

const router =
express.Router();


// ===================================
// AVAILABLE ORDERS
// ===================================

router.get(
"/available",

async (req, res) => {

try {

const orders =
await Order.find({

status:
"ready_for_pickup",

acceptedByRider:
false

})
.sort({
createdAt: -1
});

res.json(
orders
);

}

catch(err) {

console.log(err);

res.status(500).json({

message:
"Server error"

});

}

}
);


// ===================================
// ACCEPT ORDER
// ===================================

router.put(
"/accept/:orderId",

async (req, res) => {

try {

const order =
await Order.findById(
req.params.orderId
);

if (!order) {

return res.status(404).json({
message:
"Order not found"
});

}

if (
order.acceptedByRider
) {

return res.status(400).json({
message:
"Already accepted"
});

}

const rider =
await Rider.findById(
req.body.riderId
);

if (!rider) {

return res.status(404).json({
message:
"Rider not found"
});

}

order.acceptedByRider =
true;

order.riderId =
rider._id;

order.riderName =
rider.fullName;

order.riderPhone =
rider.phone;

order.status =
"assigned_to_rider";

await order.save();

// ===================================
// START DELIVERY
// ===================================

router.put(
"/start/:orderId",

async (req, res) => {

try {

const order =
await Order.findById(
req.params.orderId
);

if (!order) {

return res.status(404).json({
message:
"Order not found"
});

}

order.status =
"out_for_delivery";

await order.save();

res.json({
message:
"Delivery started"
});

}

catch(err) {

console.log(err);

res.status(500).json({
message:
"Server error"
});

}

}
);

// ===================================
// COMPLETE DELIVERY
// ===================================

router.put(
"/complete/:orderId",

async (req, res) => {

try {

const order =
await Order.findById(
req.params.orderId
);

if (!order) {

return res.status(404).json({
message:
"Order not found"
});

}

order.status =
"delivered";

await order.save();

res.json({
message:
"Delivery completed"
});

}

catch(err) {

console.log(err);

res.status(500).json({
message:
"Server error"
});

}

}
);

res.json({
message:
"Order accepted"
});

}

catch(err) {

console.log(err);

res.status(500).json({
message:
"Server error"
});

}

}
);

// ===================================
// MY ASSIGNED ORDERS
// ===================================

router.get(
"/my-orders/:riderId",

async (req, res) => {

try {

const orders =
await Order.find({

riderId:
req.params.riderId

})
.sort({
createdAt: -1
});

res.json(
orders
);

}

catch(err) {

console.log(err);

res.status(500).json({

message:
"Server error"

});

}

}
);


// ===================================
// UPDATE RIDER LIVE LOCATION
// ===================================

router.put(
"/location/:orderId",
riderAuthMiddleware,

async (req, res) => {

try {

const {
latitude,
longitude
} = req.body;

if (
latitude == null ||
longitude == null
) {

return res.status(400).json({
message:
"Coordinates required"
});

}

const order =
await Order.findById(
req.params.orderId
);

if (!order) {

return res.status(404).json({
message:
"Order not found"
});

}

if (
order.riderId.toString() !==
req.riderId
) {

return res.status(403).json({
message:
"Unauthorized rider"
});

}

order.riderLatitude =
latitude;

order.riderLongitude =
longitude;

order.deliveryStarted =
true;

await order.save();

res.json({
success: true,
message:
"Rider location updated"
});

}

catch(err) {

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