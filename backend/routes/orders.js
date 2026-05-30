const authMiddleware =
  require("../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Shop = require("../models/Shop");
const transporter = require("../config/mailer");

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

      await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: shop.email,

        subject: "New Order Received - Mieza",

        text: `
A new order has been placed.

Customer: ${req.body.customerName}

Phone: ${req.body.customerPhone}

Address: ${req.body.customerAddress}

Products:
${productsList}

Total:
GH₵ ${req.body.totalAmount}
        `
      });

      // =====================
      // ADMIN EMAIL
      // =====================

      await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: process.env.ADMIN_EMAIL,

        subject: `New Order For ${shop.shopName}`,

        text: `
Shop:
${shop.shopName}

Customer:
${req.body.customerName}

Phone:
${req.body.customerPhone}

Address:
${req.body.customerAddress}

Products:
${productsList}

Total:
GH₵ ${req.body.totalAmount}
        `
      });
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