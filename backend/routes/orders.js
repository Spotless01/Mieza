const authMiddleware =
  require("../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Shop = require("../models/Shop");
const Notification =
require("../models/Notification");
const sendEmail =
  require("../config/brevo");

  const calculateDistance =
require("../utils/distance");

// ====================================
// 🛒 CREATE ORDER
// ====================================

router.post("/", async (req, res) => {

  try {

    const subtotal =
Number(req.body.subtotal || 0);

const shop =
await Shop.findById(
  req.body.shopId
);

if (!shop) {

  return res.status(404).json({
    message: "Shop not found"
  });

}

const distanceKm =
  calculateDistance(

    shop.latitude,
    shop.longitude,

    req.body.customerLatitude,
    req.body.customerLongitude
  );

const BASE_FEE = 5;

const PER_KM_RATE = 1.5;

let deliveryFee =

BASE_FEE +

(distanceKm * PER_KM_RATE);

deliveryFee =
Math.round(deliveryFee);

const estimatedDeliveryMinutes =
Math.round(distanceKm * 3);

const commissionRevenue =
subtotal * 0.10;

const vendorRevenue =
subtotal - commissionRevenue;

const totalAmount =
subtotal + deliveryFee;

const order = new Order({

  ...req.body,

  totalAmount,

  commissionRevenue,

  distanceKm,

  estimatedDeliveryMinutes,

  deliveryFee,

  vendorRevenue,

  settlementStatus:
  "pending",

  customerNotifications: [
    {
      message:
        "Order placed successfully."
    }
  ]

});

    await order.save();


    if (shop) {
      await Notification.create({

  shopId: shop._id,

  orderId: order._id,

  title: "New Order Received",

  message:
    `${req.body.customerName}
     placed an order worth
     GH₵ ${totalAmount}`

});

await Notification.create({

  shopId: null,

  title: "New Marketplace Order",

  message:
    `${shop.shopName}
     received an order
     worth GH₵ ${totalAmount}`

});


  const productsList =
    req.body.items
      .map(
        item =>
          `${item.name} x ${item.quantity}`
      )
      .join("\n");

  // =====================
  // VENDOR EMAIL
  // =====================

  try {

    await sendEmail(

      shop.email,

      "New Order Received - Mieza",

      `
      <h2>New Order Received</h2>

      <p><strong>Customer:</strong>
      ${req.body.customerName}</p>

      <p><strong>Phone:</strong>
      ${req.body.customerPhone}</p>

      <p><strong>Address:</strong>
      ${req.body.customerAddress}</p>

      <p><strong>Products:</strong></p>

      <pre>${productsList}</pre>

      <p><strong>Total:</strong>
      GH₵ ${totalAmount}</p>
      `
    );

  } catch (mailError) {

    console.log(
      "Vendor email failed:",
      mailError
    );

  }

  // =====================
  // ADMIN EMAIL
  // =====================

  try {

    await sendEmail(

      process.env.ADMIN_EMAIL,

      `New Order For ${shop.shopName}`,

      `
      <h2>New Order Alert</h2>

      <p><strong>Shop:</strong>
      ${shop.shopName}</p>

      <p><strong>Customer:</strong>
      ${req.body.customerName}</p>

      <p><strong>Phone:</strong>
      ${req.body.customerPhone}</p>

      <p><strong>Address:</strong>
      ${req.body.customerAddress}</p>

      <p><strong>Products:</strong></p>

      <pre>${productsList}</pre>

      <p><strong>Total:</strong>
      GH₵ ${totalAmount}</p>
      `
    );

  } catch (mailError) {

    console.log(
      "Admin email failed:",
      mailError
    );

  }

}

    res.status(201).json(order);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });
  }
});


// ====================================
// 🛍️ GET SHOP ORDERS
// ====================================

router.get(
  "/shop",
  authMiddleware,
  async (req, res) => {

    try {

      const orders = await Order.find({
        shopId: req.shopId
      }).sort({ createdAt: -1 });

      res.json(orders);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });
    }
  }
);

// ====================================
// UPDATE RIDER LOCATION
// ====================================

router.put(
  "/:orderId/location",
  authMiddleware,
  async (req, res) => {

       if (
  req.body.latitude == null ||
  req.body.longitude == null
) {
  return res.status(400).json({
    message: "Coordinates required"
  });
}

    try {

      const order =
      await Order.findById(
        req.params.orderId
      );

      if (
  order.shopId.toString() !==
  req.shopId
) {
  return res.status(403).json({
    message: "Unauthorized"
  });
}

      if (!order) {

        return res.status(404).json({
          message: "Order not found"
        });

      }

      order.riderLatitude =
      req.body.latitude;

      order.riderLongitude =
      req.body.longitude;

      order.deliveryStarted = true;

      await order.save();

      res.json({
        success: true
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// LIVE TRACKING DATA
// ====================================

router.get(
  "/tracking/live/:orderId",
  async (req, res) => {

    try {

      const order =
      await Order.findById(
        req.params.orderId
      );

      if (!order) {

        return res.status(404).json({
          message: "Order not found"
        });

      }

      const shop =
await Shop.findById(
  order.shopId
);

      if (!shop) {

  return res.status(404).json({
    message: "Shop not found"
  });

}

if (
  shop.latitude == null ||
  shop.longitude == null
) {
  return res.status(400).json({
    message: "Shop location not set"
  });
}

      res.json({

        shopLatitude:
          shop.latitude,

        shopLongitude:
          shop.longitude,

        customerLatitude:
          order.customerLatitude,

        customerLongitude:
          order.customerLongitude,

        riderLatitude:
          order.riderLatitude,

        riderLongitude:
          order.riderLongitude,

        status:
          order.status

      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);



// ====================================
// 🔄 Update Order Status
// ====================================

router.put(
  "/:orderId",
  authMiddleware,
  async (req, res) => {

    try {

      const order = await Order.findById(
        req.params.orderId
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      // Security check
      if (
        order.shopId.toString() !==
        req.shopId
      ) {
        return res.status(403).json({
          message: "Unauthorized"
        });
      }

      const newStatus =
  req.body.status;

order.status = newStatus;

order.customerNotifications.push({

  message:
    `Your order is now ${newStatus}`

});
      await order.save();

    try {

  await sendEmail(

    order.customerEmail,

    `Order Update - ${newStatus}`,

    `
    <h2>Mieza Order Update</h2>

    <p>Hello ${order.customerName},</p>

    <p>Your order status has changed.</p>

    <p>
      <strong>Status:</strong>
      ${newStatus}
    </p>

    <p>
      Order ID:
      ${order._id}
    </p>

    <p>
      Thank you for using Mieza.
    </p>
    `
  );

} catch (mailError) {

  console.log(
    "Customer email failed:",
    mailError
  );

}

      res.json(order);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });
    }
  }
);


// ====================================
// 💰 VENDOR EARNINGS SUMMARY
// ====================================

router.get(
  "/earnings/summary",
  authMiddleware,
  async (req, res) => {

    try {

      const orders =
        await Order.find({
          shopId: req.shopId
        });

      const today =
        new Date();

      const startOfToday =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

      const startOfMonth =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

      const todaySales =
        orders
          .filter(
            order =>
              new Date(
                order.createdAt
              ) >= startOfToday
          )
          .reduce(
            (sum, order) =>
              sum +
              (order.vendorRevenue || 0),
            0
          );

      const monthSales =
        orders
          .filter(
            order =>
              new Date(
                order.createdAt
              ) >= startOfMonth
          )
          .reduce(
            (sum, order) =>
              sum +
              (order.vendorRevenue || 0),
            0
          );

      const pendingSettlement =
        orders
          .filter(
            order =>
              order.settlementStatus ===
              "pending"
          )
          .reduce(
            (sum, order) =>
              sum +
              (order.vendorRevenue || 0),
            0
          );

      const totalPaidOut =
        orders
          .filter(
            order =>
              order.settlementStatus ===
              "paid"
          )
          .reduce(
            (sum, order) =>
              sum +
              (order.vendorRevenue || 0),
            0
          );

      const totalCommission =
        orders.reduce(
          (sum, order) =>
            sum +
            (order.commissionRevenue || 0),
          0
        );

      res.json({

        todaySales,

        monthSales,

        pendingSettlement,

        totalPaidOut,

        totalCommission

      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);


module.exports = router;