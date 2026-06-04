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

// ====================================
// 🛒 CREATE ORDER
// ====================================

router.post("/", async (req, res) => {

  try {

    const subtotal =
Number(req.body.subtotal || 0);

const commissionRevenue =
subtotal * 0.10;

const vendorRevenue =
subtotal - commissionRevenue;

const order = new Order({

...req.body,

commissionRevenue,

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

    const shop = await Shop.findById(
      req.body.shopId
    );


    if (shop) {
      await Notification.create({

  shopId: shop._id,

  orderId: order._id,

  title: "New Order Received",

  message:
    `${req.body.customerName}
     placed an order worth
     GH₵ ${req.body.totalAmount}`

});

await Notification.create({

  shopId: null,

  title: "New Marketplace Order",

  message:
    `${shop.shopName}
     received an order
     worth GH₵ ${req.body.totalAmount}`

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
      GH₵ ${req.body.totalAmount}</p>
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
      GH₵ ${req.body.totalAmount}</p>
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

module.exports = router;