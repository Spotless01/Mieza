const express = require("express");
const router = express.Router();

const Shop = require("../models/Shop");
const Order = require("../models/Order");

const Rider = require("../models/Rider");

const adminMiddleware =
require("../middleware/adminMiddleware");

const Settlement =
require("../models/Settlement");

const Settings = require("../models/Settings");

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
.populate(
  "shopId",
  "shopName ownerName phone email shopLocation latitude longitude"
)
.sort({ createdAt: -1 });

  res.json(

  orders.map(order => ({

    ...order.toObject(),

    vendorName:
  order.shopId?.shopName,

vendorOwner:
  order.shopId?.ownerName,

vendorPhone:
  order.shopId?.phone,

vendorEmail:
  order.shopId?.email,

    vendorLocation:
      order.shopId?.shopLocation,

    vendorLatitude:
      order.shopId?.latitude,

    vendorLongitude:
      order.shopId?.longitude

  }))

);

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

        const totalVendors =
  shops.length;

const activeVendors =
  shops.filter(
    shop =>
      shop.isApproved &&
      shop.isActive
  ).length;

const pendingVendors =
  shops.filter(
    shop =>
      !shop.isApproved
  ).length;

const suspendedVendors =
  shops.filter(
    shop =>
      shop.isApproved &&
      !shop.isActive
  ).length;

        const riders =
  await Rider.find();

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

        const deliveryCommission =
  orders.reduce(
    (sum, order) =>
      sum + (order.deliveryCommission || 0),
    0
  );

const riderEarnings =
  orders.reduce(
    (sum, order) =>
      sum + (order.riderEarnings || 0),
    0
  );

const pendingRiderSettlement =
  orders
    .filter(order =>
      order.status === "delivered" &&
      order.riderId &&
      order.riderSettlementStatus !== "paid"
    )
    .reduce(
      (sum, order) =>
        sum + (order.riderEarnings || 0),
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
  deliveryCommission +
  registrationRevenue;

      res.json({

        totalOrders:
          orders.length,

        totalRiders:
          riders.length,

          totalVendors,

activeVendors,

pendingVendors,

suspendedVendors,

        productRevenue,

        deliveryRevenue,

        deliveryCommission,

        riderEarnings,

        pendingRiderSettlement,

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

    settlementType:
      "vendor",

    shopId:
      shop._id,

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

// ====================================
// ALL RIDERS
// ====================================

router.get(
  "/riders",
  adminMiddleware,
  async (req, res) => {

    try {

      const riders =
        await Rider.find()
          .sort({ createdAt: -1 });

      const riderData = [];

      for (const rider of riders) {

        const deliveredOrders =
          await Order.find({
            riderId: rider._id,
            status: "delivered"
          });

        const totalEarnings =
          deliveredOrders.reduce(
            (sum, order) =>
              sum + (order.riderEarnings || 0),
            0
          );

        const pendingSettlement =
          deliveredOrders
            .filter(order =>
              order.riderSettlementStatus !== "paid"
            )
            .reduce(
              (sum, order) =>
                sum + (order.riderEarnings || 0),
              0
            );

        riderData.push({

          _id:
            rider._id,

          fullName:
            rider.fullName,

          phone:
            rider.phone,

          email:
            rider.email,

          vehicleType:
            rider.vehicleType,

          isAvailable:
            rider.isAvailable,

          totalEarnings,

          pendingSettlement,

          isApproved:
          rider.isApproved,

        isActive:
          rider.isActive,

        });

      }

      res.json(riderData);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// ALL PENDING RIDER SETTLEMENTS
// ====================================

router.get(
  "/rider-settlements",
  adminMiddleware,
  async (req, res) => {

    try {

      const riders =
        await Rider.find();

      const settlements = [];

      for (const rider of riders) {

        const orders =
          await Order.find({

            riderId: rider._id,

            status: "delivered",

            riderSettlementStatus:
              "pending"

          });

        const pendingSettlement =
          orders.reduce(
            (sum, order) =>
              sum +
              (order.riderEarnings || 0),
            0
          );

        if (pendingSettlement > 0) {

          settlements.push({

            riderId: rider._id,

            fullName:
              rider.fullName,

            phone:
              rider.phone,

            email:
              rider.email,

            vehicleType:
              rider.vehicleType,

            payoutMethod:
              rider.payoutMethod,

            momoNumber:
              rider.momoNumber,

            momoName:
              rider.momoName,

            momoNetwork:
              rider.momoNetwork,

            bankName:
              rider.bankName,

            accountName:
              rider.accountName,

            accountNumber:
              rider.accountNumber,

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


// ====================================
// PAY RIDER
// ====================================

router.post(
  "/riders/:id/settle",
  adminMiddleware,
  async (req, res) => {

    try {

      const rider =
        await Rider.findById(
          req.params.id
        );

      if (!rider) {

        return res.status(404).json({
          message: "Rider not found"
        });

      }

      const orders =
        await Order.find({

          riderId: rider._id,

          status: "delivered",

          riderSettlementStatus:
            "pending"

        });

      const amountPaid =
        orders.reduce(
          (sum, order) =>
            sum +
            (order.riderEarnings || 0),
          0
        );

      if (amountPaid <= 0) {

        return res.status(400).json({
          message: "No pending rider settlement"
        });

      }

      const settlement =
        await Settlement.create({

          settlementType:
            "rider",

          riderId:
            rider._id,

          amountPaid,

          payoutMethod:
            rider.payoutMethod,

          status:
            "completed"

        });

      await Order.updateMany(

        {
          riderId: rider._id,
          status: "delivered",
          riderSettlementStatus:
            "pending"
        },

        {
          riderSettlementStatus:
            "paid"
        }

      );

      res.json({

        message:
          "Rider settlement recorded",

        settlement

      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// GET ADMIN SETTINGS
// ====================================

router.get(
  "/settings",
  adminMiddleware,
  async (req, res) => {

    try {

      let settings =
        await Settings.findOne();

      if (!settings) {

        settings =
          await Settings.create({});

      }

      res.json(settings);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);


// ====================================
// UPDATE ADMIN SETTINGS
// ====================================

router.put(
  "/settings",
  adminMiddleware,
  async (req, res) => {

    try {

      let settings =
        await Settings.findOne();

      if (!settings) {

        settings =
          await Settings.create({});

      }

      settings.vendorCommissionRate =
        Number(
          req.body.vendorCommissionRate ??
          settings.vendorCommissionRate
        );

      settings.riderCommissionRate =
        Number(
          req.body.riderCommissionRate ??
          settings.riderCommissionRate
        );

      settings.supportEmail =
        req.body.supportEmail ??
        settings.supportEmail;

      settings.supportPhone1 =
        req.body.supportPhone1 ??
        settings.supportPhone1;

      settings.supportPhone2 =
        req.body.supportPhone2 ??
        settings.supportPhone2;

        settings.supportPhone3 =
        req.body.supportPhone3 ??
        settings.supportPhone3;

      settings.supportPhone4 =
        req.body.supportPhone4 ??
        settings.supportPhone4  ;

      settings.businessLocation =
        req.body.businessLocation ??
        settings.businessLocation;

      settings.workingHours =
        req.body.workingHours ??
        settings.workingHours;

        settings.shopRegistrationFee =
  Number(
    req.body.shopRegistrationFee ??
    settings.shopRegistrationFee
  );

settings.riderRegistrationFee =
  Number(
    req.body.riderRegistrationFee ??
    settings.riderRegistrationFee
  );

settings.shopRegistrationPaymentRequired =
  req.body.shopRegistrationPaymentRequired ??
  settings.shopRegistrationPaymentRequired;

settings.riderRegistrationPaymentRequired =
  req.body.riderRegistrationPaymentRequired ??
  settings.riderRegistrationPaymentRequired;

      await settings.save();

      res.json({
        message: "Settings updated",
        settings
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// APPROVE RIDER
// ====================================

router.put(
  "/riders/:id/approve",
  adminMiddleware,
  async (req, res) => {

    try {

      const rider =
        await Rider.findById(
          req.params.id
        );

      if (!rider) {
        return res.status(404).json({
          message: "Rider not found"
        });
      }

      rider.isApproved = true;

      await rider.save();

      res.json({
        message: "Rider approved",
        rider
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);


// ====================================
// SUSPEND RIDER
// ====================================

router.put(
  "/riders/:id/suspend",
  adminMiddleware,
  async (req, res) => {

    try {

      const rider =
        await Rider.findById(
          req.params.id
        );

      if (!rider) {
        return res.status(404).json({
          message: "Rider not found"
        });
      }

      rider.isActive = false;

      await rider.save();

      res.json({
        message: "Rider suspended",
        rider
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);


// ====================================
// ACTIVATE RIDER
// ====================================

router.put(
  "/riders/:id/activate",
  adminMiddleware,
  async (req, res) => {

    try {

      const rider =
        await Rider.findById(
          req.params.id
        );

      if (!rider) {
        return res.status(404).json({
          message: "Rider not found"
        });
      }

      rider.isActive = true;

      await rider.save();

      res.json({
        message: "Rider activated",
        rider
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// DELETE SHOP
// ====================================

router.delete(
  "/shops/:id",
  adminMiddleware,
  async (req, res) => {

    try {

      const shop =
        await Shop.findById(req.params.id);

      if (!shop) {
        return res.status(404).json({
          message: "Shop not found"
        });
      }

      const pendingOrders =
        await Order.find({
          shopId: shop._id,
          settlementStatus: "pending"
        });

      if (pendingOrders.length > 0) {
        return res.status(400).json({
          message:
            "Cannot delete shop with pending vendor settlement."
        });
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.json({
        message: "Shop deleted successfully"
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);


// ====================================
// DELETE RIDER
// ====================================

router.delete(
  "/riders/:id",
  adminMiddleware,
  async (req, res) => {

    try {

      const rider =
        await Rider.findById(req.params.id);

      if (!rider) {
        return res.status(404).json({
          message: "Rider not found"
        });
      }

      const pendingOrders =
        await Order.find({
          riderId: rider._id,
          riderSettlementStatus: "pending",
          status: "delivered"
        });

      if (pendingOrders.length > 0) {
        return res.status(400).json({
          message:
            "Cannot delete rider with pending rider settlement."
        });
      }

      await Rider.findByIdAndDelete(req.params.id);

      res.json({
        message: "Rider deleted successfully"
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// ADMIN NOTIFICATIONS
// ====================================

router.get(
  "/notifications",
  adminMiddleware,
  async (req, res) => {

    try {

      const pendingShops =
        await Shop.find({
          isApproved: false
        }).sort({
          createdAt: -1
        });

      const pendingRiders =
        await Rider.find({
          isApproved: false
        }).sort({
          createdAt: -1
        });

      res.json({

        pendingShops:
          pendingShops.map(shop => ({
            type: "shop",
            id: shop._id,
            name: shop.shopName,
            phone: shop.phone,
            email: shop.email,
            createdAt: shop.createdAt
          })),

        pendingRiders:
          pendingRiders.map(rider => ({
            type: "rider",
            id: rider._id,
            name: rider.fullName,
            phone: rider.phone,
            email: rider.email,
            vehicleType: rider.vehicleType,
            createdAt: rider.createdAt
          })),

        totalPending:
          pendingShops.length +
          pendingRiders.length

      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

module.exports = router;