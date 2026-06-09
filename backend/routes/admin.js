const express = require("express");
const router = express.Router();

const Shop = require("../models/Shop");
const Order = require("../models/Order");

const adminMiddleware =
require("../middleware/adminMiddleware");

const Settlement =
require("../models/Settlement");

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

      const shops =
        await Shop.find();

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

      const marketplaceRevenue =
        productRevenue +
        deliveryRevenue;

      const commissionRevenue =
  orders.reduce(
    (sum, order) =>
      sum +
      (order.commissionRevenue || 0),
    0
  );

      const vendorRevenue =
  orders.reduce(
    (sum, order) =>
      sum +
      (order.vendorRevenue || 0),
    0
  );

      const registrationRevenue =
        shops.reduce(
          (sum, shop) =>
            sum +
            (shop.registrationFee || 0),
          0
        );

      const miezaRevenue =
        commissionRevenue +
        deliveryRevenue +
        registrationRevenue;

      res.json({

        totalOrders:
          orders.length,

        productRevenue,

        deliveryRevenue,

        totalMarketplaceRevenue:
          marketplaceRevenue,

        commissionRevenue,

        vendorRevenue,

        registrationRevenue,

        miezaRevenue

      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// SHOP REVENUE DETAILS
// ====================================

router.get(
  "/shops/:id/details",
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

      const orders =
        await Order.find({
          shopId: shop._id
        });

      const totalOrders =
        orders.length;

      const productRevenue =
        orders.reduce(
          (sum, order) =>
            sum +
            (order.subtotal || 0),
          0
        );

      const commissionRevenue =
        orders.reduce(
          (sum, order) =>
            sum +
            (order.commissionRevenue || 0),
          0
        );

      const vendorRevenue =
        orders.reduce(
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

      res.json({

        shopName:
          shop.shopName,

        ownerName:
          shop.ownerName,

        email:
          shop.email,

        phone:
          shop.phone,

          shopLocation:
    shop.shopLocation,

  latitude:
    shop.latitude,

  longitude:
    shop.longitude,

          payoutMethod:
  shop.payoutMethod,

momoNumber:
  shop.momoNumber,

momoName:
  shop.momoName,

momoNetwork:
  shop.momoNetwork,

bankName:
  shop.bankName,

accountName:
  shop.accountName,

accountNumber:
  shop.accountNumber,

        totalOrders,

        productRevenue,

        commissionRevenue,

        vendorRevenue,

        pendingSettlement,

        orders

      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// PAY VENDOR
// ====================================

router.post(
  "/shops/:id/settle",
  adminMiddleware,
  async (req, res) => {

    try {

      const shop =
        await Shop.findById(
          req.params.id
        );

      if (!shop) {

        return res.status(404).json({
          message:
            "Shop not found"
        });

      }

      const orders =
        await Order.find({

          shopId: shop._id,

          settlementStatus:
            "pending"

        });

      const amountPaid =
        orders.reduce(
          (sum, order) =>
            sum +
            (order.vendorRevenue || 0),
          0
        );

      if (amountPaid <= 0) {

        return res.status(400).json({
          message:
            "No pending settlement"
        });

      }

      const settlement =
        await Settlement.create({

          shopId: shop._id,

          amountPaid,

          payoutMethod:
  shop.payoutMethod,

          status: "completed"

        });

      await Order.updateMany(

        {
          shopId: shop._id,
          settlementStatus:
            "pending"
        },

        {
          settlementStatus:
            "paid"
        }

      );

      res.json({

        message:
          "Settlement recorded",

        settlement

      });

    } catch (err) {

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);


// ====================================
// SHOP SETTLEMENT HISTORY
// ====================================

router.get(
  "/shops/:id/settlements",
  adminMiddleware,
  async (req, res) => {

    try {

      const settlements =
        await Settlement.find({

          shopId:
            req.params.id

        }).sort({
          createdAt: -1
        });

      res.json(
        settlements
      );

    } catch (err) {

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);

// ====================================
// ALL PENDING SETTLEMENTS
// ====================================

router.get(
  "/settlements",
  adminMiddleware,
  async (req, res) => {

    try {

      const shops =
        await Shop.find();

      const settlements = [];

      for (const shop of shops) {

        const orders =
          await Order.find({

            shopId: shop._id,

            settlementStatus:
              "pending"

          });

        const pendingSettlement =
          orders.reduce(
            (sum, order) =>
              sum +
              (order.vendorRevenue || 0),
            0
          );

        if (pendingSettlement > 0) {

          settlements.push({

            shopId: shop._id,

            shopName:
              shop.shopName,

            ownerName:
              shop.ownerName,

            phone:
              shop.phone,

            email:
              shop.email,

            pendingSettlement

          });

        }

      }

      res.json(settlements);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

module.exports = router;