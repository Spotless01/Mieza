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

      const productRevenue =
        orders.reduce(
          (sum, order) =>
            sum + (order.subtotal || 0),
          0
        );

      const deliveryRevenue =
        orders.reduce(
          (sum, order) =>
            sum + (order.deliveryFee || 0),
          0
        );

      const totalMarketplaceRevenue =
        productRevenue +
        deliveryRevenue;

      const vendorRevenue =
        productRevenue;

      const miezaRevenue =
        deliveryRevenue;

      res.json({

        totalOrders:
          orders.length,

        productRevenue,

        deliveryRevenue,

        totalMarketplaceRevenue,

        vendorRevenue,

        miezaRevenue

      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);



module.exports = router;