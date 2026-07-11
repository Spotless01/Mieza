const express = require("express");
const router = express.Router();

const Shop = require("../models/Shop");
const Order = require("../models/Order");

const Rider = require("../models/Rider");

const adminMiddleware =
require("../middleware/adminMiddleware");

const requireAdminRole =
  require(
    "../middleware/requireAdminRole"
  );

  const bcrypt =
  require("bcryptjs");

const Admin =
  require("../models/Admin");

const Settlement =
require("../models/Settlement");

const Settings = require("../models/Settings");



router.get(
  "/shops",
  adminMiddleware,
  async (req, res) => {

    try {

      let query = {};

      if (
        req.admin.role ===
        "cofounder"
      ) {
        query = {
          $or: [
            {
              isApproved: false
            },
            {
              isApproved: true,
              isActive: true
            }
          ]
        };
      }

      const shops =
        await Shop.find(query)
          .select(
            [
              "_id",
              "shopName",
              "ownerName",
              "email",
              "phone",
              "shopLocation",
              "isApproved",
              "isActive",
              "createdAt"
            ].join(" ")
          )
          .sort({
            createdAt: -1
          });

      res.json(shops);

    } catch (err) {

      res.status(500).json({
        message:
          "Unable to load shops"
      });

    }

  }
);

router.put(
  "/shops/:id/approve",
  adminMiddleware,
  requireAdminRole(
    "owner",
    "cofounder"
  ),
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
shop.isActive = true;

await shop.save();

res.json({
  message: "Shop approved",
  shop
});

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

  requireAdminRole(
    "owner"
  ),

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

  requireAdminRole(
    "owner"
  ),

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

const riderCommissionOwed =
  orders
    .filter(order =>
      order.status === "delivered" &&
      order.riderCommissionStatus !== "paid"
    )
    .reduce(
      (sum, order) =>
        sum + (order.deliveryCommission || 0),
      0
    );

const riderCommissionPaid =
  orders
    .filter(order =>
      order.riderCommissionStatus === "paid"
    )
    .reduce(
      (sum, order) =>
        sum + (order.deliveryCommission || 0),
      0
    );

const vendorCommissionOwed =
  orders
    .filter(order =>
      order.status === "delivered" &&
      order.vendorCommissionStatus !== "paid"
    )
    .reduce(
      (sum, order) =>
        sum + (order.commissionRevenue || 0),
      0
    );

const vendorCommissionPaid =
  orders
    .filter(order =>
      order.vendorCommissionStatus === "paid"
    )
    .reduce(
      (sum, order) =>
        sum + (order.commissionRevenue || 0),
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

        riderCommissionOwed,

riderCommissionPaid,
vendorCommissionOwed,
vendorCommissionPaid,

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

      if (
  req.admin.role === "cofounder" &&
  shop.isApproved &&
  !shop.isActive
) {
  return res.status(403).json({
    message:
      "You do not have permission to view this shop"
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

      const commissionOwed =
  orders
    .filter(order =>
      order.vendorCommissionStatus !== "paid"
    )
    .reduce(
      (sum, order) =>
        sum + (order.commissionRevenue || 0),
      0
    );

const commissionPaid =
  orders
    .filter(order =>
      order.vendorCommissionStatus === "paid"
    )
    .reduce(
      (sum, order) =>
        sum + (order.commissionRevenue || 0),
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

          ...(req.admin.role === "owner"
  ? {
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
        shop.accountNumber
    }
  : {}),

        totalOrders,

        productRevenue,

        commissionRevenue,

        vendorRevenue,

        commissionOwed,
commissionPaid,

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
// MARK VENDOR COMMISSION AS PAID
// ====================================

router.post(
  "/shops/:id/commission-paid",
  adminMiddleware,

  requireAdminRole(
    "owner"
  ),

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

      const eligibleOrders =
        await Order.find({
          shopId: shop._id,
          status: "delivered",
          paymentStatus: "confirmed",
          vendorCommissionStatus: {
            $ne: "paid"
          }
        });

      const amountPaid =
        eligibleOrders.reduce(
          (sum, order) =>
            sum +
            Number(
              order.commissionRevenue || 0
            ),
          0
        );

      if (amountPaid <= 0) {
        return res.status(400).json({
          message:
            "No unpaid vendor commission found"
        });
      }

      const paymentReference =
        String(
          req.body.paymentReference || ""
        ).trim();

      if (!paymentReference) {
        return res.status(400).json({
          message:
            "Commission payment reference is required"
        });
      }

      const settlement =
        await Settlement.create({

          settlementType:
            "vendor_commission",

          shopId:
            shop._id,

          amountPaid,

          payoutMethod:
            "momo_to_mieza",

          status:
            "completed",

          paystackTransferReference:
            paymentReference,

          orders:
            eligibleOrders.map(
              order => order._id
            )

        });

      await Order.updateMany(
        {
          _id: {
            $in:
              eligibleOrders.map(
                order => order._id
              )
          }
        },
        {
          $set: {
            vendorCommissionStatus:
              "paid",

            vendorCommissionPaidAt:
              new Date()
          }
        }
      );

      res.json({
        message:
          "Vendor commission marked as paid",
        amountPaid,
        settlement
      });

    } catch (err) {

      console.log(
        "Vendor commission confirmation error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to confirm vendor commission payment"
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

  requireAdminRole(
    "owner"
  ),

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
// ALL UNPAID VENDOR COMMISSIONS
// ====================================

router.get(
  "/settlements",
  adminMiddleware,

  requireAdminRole(
    "owner"
  ),

  async (req, res) => {

    try {
      const shops =
        await Shop.find();

      const commissions = [];

      for (const shop of shops) {
        const orders =
          await Order.find({
            shopId: shop._id,
            status: "delivered",
            paymentStatus: "confirmed",
            vendorCommissionStatus: {
              $ne: "paid"
            }
          });

        const commissionOwed =
          orders.reduce(
            (sum, order) =>
              sum +
              Number(
                order.commissionRevenue || 0
              ),
            0
          );

        if (commissionOwed > 0) {
          commissions.push({
            shopId: shop._id,
            shopName: shop.shopName,
            ownerName: shop.ownerName,
            phone: shop.phone,
            email: shop.email,
            commissionOwed,
            unpaidOrderCount:
              orders.length
          });
        }
      }

      res.json(commissions);

    } catch (err) {
      console.log(
        "Vendor commission list error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to load vendor commissions"
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

      let riderQuery = {};

      if (
        req.admin.role ===
        "cofounder"
      ) {
        riderQuery = {
          $or: [
            {
              isApproved: false
            },
            {
              isApproved: true,
              isActive: true
            }
          ]
        };
      }

      const riders =
        await Rider.find(riderQuery)
          .sort({
            createdAt: -1
          });

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
              sum +
              Number(
                order.riderEarnings || 0
              ),
            0
          );

        const commissionOwed =
          deliveredOrders
            .filter(order =>
              order.riderCommissionStatus !==
              "paid"
            )
            .reduce(
              (sum, order) =>
                sum +
                Number(
                  order.deliveryCommission || 0
                ),
              0
            );

        riderData.push({
          _id: rider._id,
          fullName: rider.fullName,
          phone: rider.phone,
          email: rider.email,
          vehicleType:
            rider.vehicleType,
          isAvailable:
            rider.isAvailable,
          totalEarnings,
          commissionOwed,
          isApproved:
            rider.isApproved,
          isActive:
            rider.isActive
        });

      }

      res.json(riderData);

    } catch (err) {

      res.status(500).json({
        message:
          "Unable to load riders"
      });

    }

  }
);

// ====================================
// ALL UNPAID RIDER COMMISSIONS
// ====================================

router.get(
  "/rider-settlements",
  adminMiddleware,

  requireAdminRole(
    "owner"
  ),

  async (req, res) => {

    try {
      const riders =
        await Rider.find();

      const commissions = [];

      for (const rider of riders) {
        const orders =
          await Order.find({
            riderId: rider._id,
            status: "delivered",
            riderCommissionStatus: {
              $ne: "paid"
            }
          });

        const commissionOwed =
          orders.reduce(
            (sum, order) =>
              sum +
              Number(
                order.deliveryCommission || 0
              ),
            0
          );

        if (commissionOwed > 0) {
          commissions.push({
            riderId: rider._id,
            fullName: rider.fullName,
            phone: rider.phone,
            email: rider.email,
            vehicleType:
              rider.vehicleType,
            commissionOwed,
            unpaidOrderCount:
              orders.length
          });
        }
      }

      res.json(commissions);

    } catch (err) {
      console.log(
        "Rider commission list error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to load rider commissions"
      });
    }

  }
);


// ====================================
// MARK RIDER COMMISSION AS PAID
// ====================================

router.post(
  "/riders/:id/commission-paid",
  adminMiddleware,

  requireAdminRole(
    "owner"
  ),

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

      const eligibleOrders =
        await Order.find({
          riderId: rider._id,
          status: "delivered",
          riderCommissionStatus: {
            $ne: "paid"
          }
        });

      const amountPaid =
        eligibleOrders.reduce(
          (sum, order) =>
            sum +
            Number(
              order.deliveryCommission || 0
            ),
          0
        );

      if (amountPaid <= 0) {
        return res.status(400).json({
          message:
            "No unpaid rider commission found"
        });
      }

      const paymentReference =
        String(
          req.body.paymentReference || ""
        ).trim();

      if (!paymentReference) {
        return res.status(400).json({
          message:
            "Commission payment reference is required"
        });
      }

      const settlement =
        await Settlement.create({

          settlementType:
            "rider_commission",

          riderId:
            rider._id,

          amountPaid,

          payoutMethod:
            "momo_to_mieza",

          status:
            "completed",

          paystackTransferReference:
            paymentReference,

          orders:
            eligibleOrders.map(
              order => order._id
            )

        });

      await Order.updateMany(
        {
          _id: {
            $in:
              eligibleOrders.map(
                order => order._id
              )
          }
        },
        {
          $set: {
            riderCommissionStatus:
              "paid",

            riderCommissionPaidAt:
              new Date()
          }
        }
      );

      res.json({
        message:
          "Rider commission marked as paid",
        amountPaid,
        settlement
      });

    } catch (err) {

      console.log(
        "Rider commission confirmation error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to confirm rider commission payment"
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

  requireAdminRole(
    "owner"
  ),

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

  requireAdminRole(
    "owner"
  ),

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
        settings.supportPhone4;

      settings.supportPhone5 =
        req.body.supportPhone5 ??
        settings.supportPhone5;

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

        settings.autoPayoutEnabled =
        req.body.autoPayoutEnabled ??
        settings.autoPayoutEnabled;

      settings.settlementFrequency =
        req.body.settlementFrequency ??
        settings.settlementFrequency;

      settings.settlementHour =
        Number(
          req.body.settlementHour ??
          settings.settlementHour
        );

      settings.minimumSettlementAmount =
        Number(
          req.body.minimumSettlementAmount ??
          settings.minimumSettlementAmount
        );

      settings.retryFailedSettlements =
        req.body.retryFailedSettlements ??
        settings.retryFailedSettlements;

        settings.termsAndConditions =
  req.body.termsAndConditions ??
  settings.termsAndConditions;

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
  requireAdminRole(
    "owner",
    "cofounder"
  ),
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
rider.isActive = true;

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

  requireAdminRole(
    "owner"
  ),

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

  requireAdminRole(
    "owner"
  ),

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

  requireAdminRole(
    "owner"
  ),

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
    status: "delivered",
    paymentStatus: "confirmed",
    vendorCommissionStatus: {
      $ne: "paid"
    }
  });

      if (pendingOrders.length > 0) {
        return res.status(400).json({
          message:
            "Cannot delete shop with unpaid commission owed to Mieza."
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

  requireAdminRole(
    "owner"
  ),

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
    status: "delivered",
    riderCommissionStatus: {
      $ne: "paid"
    }
  });

      if (pendingOrders.length > 0) {
        return res.status(400).json({
          message:
            "Cannot delete rider with unpaid commission owed to Mieza."
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


// ====================================
// CREATE CO-FOUNDER ADMIN
// ====================================

router.post(
  "/admin-users",

  adminMiddleware,

  requireAdminRole("owner"),

  async (req, res) => {

    try {

      const name =
        String(
          req.body.name || ""
        ).trim();

      const email =
        String(
          req.body.email || ""
        )
          .trim()
          .toLowerCase();

      const password =
        String(
          req.body.password || ""
        );

      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(400).json({
          message:
            "Name, email and password are required"
        });

      }

      const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(email)) {
  return res.status(400).json({
    message:
      "Enter a valid email address"
  });
}


      if (password.length < 8) {

        return res.status(400).json({
          message:
            "Password must be at least 8 characters"
        });

      }

      const existing =
        await Admin.findOne({
          email
        });

      if (existing) {

        return res.status(409).json({
          message:
            "An admin with this email already exists"
        });

      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );

      const admin =
        await Admin.create({
          name,
          email,

          password:
            hashedPassword,

          role:
            "cofounder",

          isActive:
            true,

          createdBy:
            req.admin.id
        });

      res.status(201).json({
        message:
          "Co-founder account created",

        admin: {
          id:
            admin._id,

          name:
            admin.name,

          email:
            admin.email,

          role:
            admin.role,

          isActive:
            admin.isActive
        }
      });

    } catch (err) {

      console.log(
        "Create admin error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to create co-founder account"
      });

    }

  }
);



// ====================================
// LIST ADMIN ACCOUNTS
// ====================================

router.get(
  "/admin-users",

  adminMiddleware,

  requireAdminRole("owner"),

  async (req, res) => {

    try {

      const admins =
        await Admin.find()
          .select(
            "_id name email role isActive lastLoginAt createdAt"
          )
          .sort({
            createdAt: -1
          });

      res.json(admins);

    } catch (err) {

      res.status(500).json({
        message:
          "Unable to load admin accounts"
      });

    }

  }
);



// ====================================
// ENABLE OR DISABLE ADMIN ACCOUNT
// ====================================

router.put(
  "/admin-users/:id/status",

  adminMiddleware,

  requireAdminRole("owner"),

  async (req, res) => {

    try {

      const admin =
        await Admin.findById(
          req.params.id
        );

      if (!admin) {

        return res.status(404).json({
          message:
            "Admin account not found"
        });

      }

      if (
        admin.role === "owner"
      ) {

        return res.status(400).json({
          message:
            "The owner account cannot be disabled here"
        });

      }

      if (
  typeof req.body.isActive !==
  "boolean"
) {
  return res.status(400).json({
    message:
      "isActive must be true or false"
  });
}

admin.isActive =
  req.body.isActive;

      await admin.save();

      res.json({
        message:
          admin.isActive
            ? "Admin account activated"
            : "Admin account disabled"
      });

    } catch (err) {

      res.status(500).json({
        message:
          "Unable to update admin account"
      });

    }

  }
);

module.exports = router;