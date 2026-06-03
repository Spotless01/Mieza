const express = require("express");
const router = express.Router();

const Shop = require("../models/Shop");
const Order = require("../models/Order");

const adminMiddleware =
require("../middleware/adminMiddleware");

router.get(
  "/shops",
  adminMiddleware,
  async (req, res) => {

  try {

    const shops =
      await Shop.find()
      .sort({ createdAt: -1 });

    res.json(shops);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

router.put(
  "/shops/:id/approve",
  adminMiddleware,
  async (req, res) => {

    try {

      const shop =
        await Shop.findById(
          req.params.id
        );

      if (!shop) {

        return res.status(404).json({
          message: "Shop not found"
        });

      }

      shop.isApproved = true;

      await shop.save();

      res.json(shop);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);


router.put(
  "/shops/:id/suspend",
  adminMiddleware,
  async (req, res) => {

    try {

      const shop =
        await Shop.findById(
          req.params.id
        );

      if (!shop) {

        return res.status(404).json({
          message: "Shop not found"
        });

      }

      shop.isActive = false;

      await shop.save();

      res.json(shop);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

router.put(
  "/shops/:id/activate",
  adminMiddleware,
  async (req, res) => {

    try {

      const shop =
        await Shop.findById(
          req.params.id
        );

      if (!shop) {

        return res.status(404).json({
          message: "Shop not found"
        });

      }

      shop.isActive = true;

      await shop.save();

      res.json(shop);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

router.get(
  "/orders",
  adminMiddleware,
  async (req, res) => {

  try {

    const orders =
      await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

router.get(
  "/stats",
  adminMiddleware,
  async (req, res) => {

  try {

    const orders =
      await Order.find();

    const revenue =
      orders.reduce(
        (sum, order) =>
          sum + order.totalAmount,
        0
      );

    const commissions =
      revenue * 0.10;

    res.json({

      totalOrders:
        orders.length,

      revenue,

      commissions

    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});



module.exports = router;