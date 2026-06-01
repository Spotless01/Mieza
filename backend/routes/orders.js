const authMiddleware =
  require("../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Shop = require("../models/Shop");
const sendEmail =
  require("../config/brevo");

// ====================================
// 🛒 CREATE ORDER
// ====================================

router.post("/", async (req, res) => {

  try {

    const order = new Order(req.body);

    await order.save();

    const shop = await Shop.findById(
      req.body.shopId
    );

    if (shop) {

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
// 🔄 UPDATE ORDER STATUS
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

      order.status = req.body.status;

      await order.save();

      res.json(order);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });
    }
  }
);

module.exports = router;