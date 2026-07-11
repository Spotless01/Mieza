const riderAuthMiddleware =
require("../middleware/riderAuthMiddleware");

const express =
require("express");

const Order =
require("../models/Order");

const Rider =
require("../models/Rider");

const sendSMS =
require("../config/sms");

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
  riderAuthMiddleware,
  async (req, res) => {

    try {

      const order =
        await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      if (
        order.acceptedByRider ||
        order.riderId
      ) {
        return res.status(400).json({
          message:
            "This order has already been accepted by another rider"
        });
      }

      if (order.status !== "ready_for_pickup") {
        return res.status(400).json({
          message:
            "Order is not available for pickup"
        });
      }

      const rider =
        await Rider.findById(req.riderId);

      if (!rider) {
        return res.status(404).json({
          message: "Rider not found"
        });
      }

      order.acceptedByRider = true;
      order.riderId = rider._id;
      order.riderName = rider.fullName;
      order.riderPhone = rider.phone;
      order.status = "assigned_to_rider";

      order.customerNotifications.push({
        message:
          `Your order has been assigned to rider ${rider.fullName}.`
      });

      await order.save();

      res.json({
        message: "Order accepted",
        order
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Server error"
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
// COMPLETE DELIVERY WITH PIN
// ===================================

router.put(
  "/complete/:orderId",
  riderAuthMiddleware,
  async (req, res) => {

    try {

      const { deliveryPin } = req.body;

      if (!deliveryPin) {
        return res.status(400).json({
          message: "Delivery PIN is required"
        });
      }

      const order =
        await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      if (
        !order.riderId ||
        order.riderId.toString() !== req.riderId
      ) {
        return res.status(403).json({
          message: "Unauthorized rider"
        });
      }

      if (order.status === "delivered") {
        return res.status(400).json({
          message: "Order already delivered"
        });
      }

      if (String(order.deliveryPin) !== String(deliveryPin).trim()) {
        return res.status(400).json({
          message: "Incorrect delivery PIN"
        });
      }

      order.deliveryPinVerified = true;
      order.deliveryPinVerifiedAt = new Date();
      order.deliveredAt = new Date();

      order.status = "delivered";

      order.customerNotifications.push({
        message: "Your order has been delivered successfully."
      });

      await order.save();

try {

  await sendSMS(
    order.customerPhone,
`MIEZA

Your order has been delivered successfully ✅

Please rate your experience:
https://miezadelivery.com/review.html?orderId=${order._id}

Thank you for using Mieza.`
  );

} catch (smsErr) {

  console.log(
    "Review SMS failed:",
    smsErr.message
  );

}

res.json({
  message: "Delivery completed successfully",
  order
});

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Server error"
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

const unpaidCommissionOrders =
  orders.filter(order =>
    order.riderCommissionStatus !== "paid"
  );

const paidCommissionOrders =
  orders.filter(order =>
    order.riderCommissionStatus === "paid"
  );

const commissionOwed =
  unpaidCommissionOrders.reduce(
    (sum, order) =>
      sum +
      Number(order.deliveryCommission || 0),
    0
  );

const commissionPaid =
  paidCommissionOrders.reduce(
    (sum, order) =>
      sum +
      Number(order.deliveryCommission || 0),
    0
  );

const totalCommissionAccrued =
  orders.reduce(
    (sum, order) =>
      sum +
      Number(order.deliveryCommission || 0),
    0
  );

res.json({

  todayEarnings:
    sumRiderEarnings(todayOrders),

  weekEarnings:
    sumRiderEarnings(weekOrders),

  monthEarnings:
    sumRiderEarnings(monthOrders),

  commissionOwed,

  commissionPaid,

  totalDeliveryFees:
    sumDeliveryFees(orders),

  totalCommissionAccrued

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

module.exports =
router;