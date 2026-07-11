const express = require("express");
const router = express.Router();
const Shop = require("../models/Shop");
const authMiddleware = require("../middleware/authMiddleware");
const upload =
  require("../middleware/upload");

const {
  registerShop,
  getApprovedShops,
  approveShop
} = require("../controllers/shopController");

// ✅ TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ message: "Shop routes working ✅" });
});

// Register shop
router.post(
  "/register",
  upload.single("thumbnail"),
  registerShop
);

// Get approved shops
router.get("/", getApprovedShops);

// =====================================
// PUBLIC VENDOR PAYMENT DETAILS
// =====================================

router.get(
  "/:shopId/payment-details",
  async (req, res) => {

    try {

      const shop =
        await Shop.findOne({
          _id: req.params.shopId,
          isApproved: true,
          isActive: true
        }).select(
          [
            "shopName",
            "ownerName",
            "payoutMethod",
            "momoNumber",
            "momoName",
            "momoNetwork",
            "bankName",
            "accountName",
            "accountNumber"
          ].join(" ")
        );

      if (!shop) {
        return res.status(404).json({
          message:
            "Vendor payment details not found"
        });
      }

      if (shop.payoutMethod === "momo") {

        if (
          !shop.momoNumber ||
          !shop.momoName ||
          !shop.momoNetwork
        ) {
          return res.status(400).json({
            message:
              "This vendor has not completed their Mobile Money payment details."
          });
        }

      } else if (shop.payoutMethod === "bank") {

        if (
          !shop.bankName ||
          !shop.accountName ||
          !shop.accountNumber
        ) {
          return res.status(400).json({
            message:
              "This vendor has not completed their bank payment details."
          });
        }

      } else {

        return res.status(400).json({
          message:
            "This vendor has no valid payment method."
        });

      }

      res.json({
        shopId: shop._id,
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        payoutMethod: shop.payoutMethod,

        momoNumber:
          shop.payoutMethod === "momo"
            ? shop.momoNumber
            : "",

        momoName:
          shop.payoutMethod === "momo"
            ? shop.momoName
            : "",

        momoNetwork:
          shop.payoutMethod === "momo"
            ? shop.momoNetwork
            : "",

        bankName:
          shop.payoutMethod === "bank"
            ? shop.bankName
            : "",

        accountName:
          shop.payoutMethod === "bank"
            ? shop.accountName
            : "",

        accountNumber:
          shop.payoutMethod === "bank"
            ? shop.accountNumber
            : ""
      });

    } catch (err) {

      console.log(
        "Payment details error:",
        err
      );

      if (err.name === "CastError") {
        return res.status(400).json({
          message: "Invalid shop ID"
        });
      }

      res.status(500).json({
        message:
          "Unable to load vendor payment details"
      });

    }

  }
);

// Approve shop
router.put("/approve/:id", approveShop);


// ==============================
// 🔥 PRODUCT ROUTES
// ==============================

// ➕ ADD PRODUCT
router.post(
  "/products",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {

    try {

      const shop =
        await Shop.findById(req.shopId);

      if (!shop) {
        return res.status(404).json({
          message: "Shop not found"
        });
      }

      const {
        name,
        price,
        description
      } = req.body;

      const image = req.file ? req.file.path : "";

      const product = {
        name,
        price,
        description,
        image
      };

      shop.products.push(product);

      await shop.save();

      res.status(201).json({
        message: "Product added",
        product
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);

// ✏️ EDIT PRODUCT
router.put(
  "/products/:productId",
  authMiddleware,
  async (req, res) => {

    try {

      const shop = await Shop.findById(req.shopId);

      if (!shop) {
        return res.status(404).json({
          message: "Shop not found"
        });
      }

      const product = shop.products.id(
        req.params.productId
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      Object.assign(product, req.body);

      await shop.save();

      res.json(product);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });
    }
  }
);

// ❌ DELETE PRODUCT
router.delete(
  "/products/:productId",
  authMiddleware,
  async (req, res) => {

    try {

      const shop = await Shop.findById(req.shopId);

      if (!shop) {
        return res.status(404).json({
          message: "Shop not found"
        });
      }

      shop.products = shop.products.filter(
        p => p._id.toString() !== req.params.productId
      );

      await shop.save();

      res.json({
        message: "Product deleted"
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });
    }
  }
);

router.put(
  "/payout-details",
  authMiddleware,
  async (req, res) => {

    try {

      const shop =
        await Shop.findById(
          req.shopId
        );

      if (!shop) {

        return res.status(404).json({
          message:
            "Shop not found"
        });

      }

      Object.assign(
        shop,
        req.body
      );

      await shop.save();

      res.json({
        message:
          "Payout details updated"
      });

    } catch (err) {

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);


// ✅ EXPORT LAST
// =====================================
// GET CURRENT LOGGED-IN SHOP
// =====================================

router.get(
  "/my-shop",
  authMiddleware,
  async (req, res) => {

    try {

      const shop =
        await Shop.findById(req.shopId);

      if (!shop) {

        return res.status(404).json({
          message: "Shop not found"
        });
      }

      res.json(shop);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);

// =====================================
// UPDATE SHOP THUMBNAIL
// =====================================

router.put(
  "/thumbnail",
  authMiddleware,
  upload.single("thumbnail"),
  async (req, res) => {

    try {

      const shop =
        await Shop.findById(req.shopId);

      if (!shop) {
        return res.status(404).json({
          message: "Shop not found"
        });
      }

      const thumbnailUrl =
        req.body.thumbnailUrl || "";

      if (!req.file && !thumbnailUrl) {
        return res.status(400).json({
          message:
            "Please upload an image or paste an image URL"
        });
      }

      shop.thumbnail =
        req.file
          ? req.file.path
          : thumbnailUrl;

      await shop.save();

      res.json({
        message: "Shop thumbnail updated",
        thumbnail: shop.thumbnail
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// =====================================
// UPDATE SHOP OPENING HOURS
// =====================================

router.put(
  "/opening-hours",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        openingTime,
        closingTime
      } = req.body;

      if (!openingTime || !closingTime) {
        return res.status(400).json({
          message: "Opening and closing time are required"
        });
      }

      const shop =
        await Shop.findById(req.shopId);

      if (!shop) {
        return res.status(404).json({
          message: "Shop not found"
        });
      }

      shop.openingHours = {
        open: openingTime,
        close: closingTime
      };

      await shop.save();

      res.json({
        message: "Opening hours updated",
        openingHours: shop.openingHours
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

module.exports = router;