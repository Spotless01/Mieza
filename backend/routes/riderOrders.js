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
  status: "ready_for_pickup",
  acceptedByRider: false
})
.populate(
  "shopId",
  "shopName phone shopLocation latitude longitude"
)
.sort({
  createdAt: -1
});

res.json(orders);

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

if (order.acceptedByRider) {

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

order.customerNotifications.push({
message:
`Your order has been assigned to rider ${rider.fullName}.`
});

await order.save();

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

order.customerNotifications.push({
message:
"Your order is now out for delivery."
});

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

order.customerNotifications.push({
message:
"Your order has been delivered."
});

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
.populate(
  "shopId",
  "shopName phone shopLocation latitude longitude"
)
.sort({
  createdAt: -1
});

res.json(orders);

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
!order.riderId ||
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

// ===================================
// RIDER EARNINGS SUMMARY
// ===================================

router.get(
"/earnings/:riderId",

async (req, res) => {

try {

const orders =
await Order.find({
  riderId: req.params.riderId,
  status: "delivered"
});

const now =
new Date();

const startOfToday =
new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
);

const startOfWeek =
new Date(startOfToday);

startOfWeek.setDate(
  startOfToday.getDate() - startOfToday.getDay()
);

const startOfMonth =
new Date(
  now.getFullYear(),
  now.getMonth(),
  1
);

const sumRiderEarnings = list =>
  list.reduce(
    (sum, order) =>
      sum + (order.riderEarnings || 0),
    0
  );

const sumDeliveryFees = list =>
  list.reduce(
    (sum, order) =>
      sum + (order.deliveryFee || 0),
    0
  );

const sumMiezaCommission = list =>
  list.reduce(
    (sum, order) =>
      sum + (order.deliveryCommission || 0),
    0
  );

const todayOrders =
orders.filter(order =>
  new Date(order.updatedAt) >= startOfToday
);

const weekOrders =
orders.filter(order =>
  new Date(order.updatedAt) >= startOfWeek
);

const monthOrders =
orders.filter(order =>
  new Date(order.updatedAt) >= startOfMonth
);

const pendingOrders =
orders.filter(order =>
  order.riderSettlementStatus !== "paid"
);

const paidOrders =
orders.filter(order =>
  order.riderSettlementStatus === "paid"
);

res.json({

  todayEarnings:
    sumRiderEarnings(todayOrders),

  weekEarnings:
    sumRiderEarnings(weekOrders),

  monthEarnings:
    sumRiderEarnings(monthOrders),

  pendingSettlement:
    sumRiderEarnings(pendingOrders),

  totalPaidOut:
    sumRiderEarnings(paidOrders),

  totalDeliveryFees:
    sumDeliveryFees(orders),

  totalMiezaCommission:
    sumMiezaCommission(orders)

});

}

catch(err) {

console.log(err);

res.status(500).json({
  message: "Server error"
});

}

}
);

router.post("/accept/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }


    if (order.riderAcceptanceStatus === "accepted") {
      return res.status(400).json({
        message: "Order already taken"
      });
    }

    order.assignedRiderId = req.riderId;
    order.riderAcceptanceStatus = "accepted";
    order.status = "out_for_delivery";

    await order.save();

    res.json({
      message: "Order accepted successfully",
      order
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports =
router;