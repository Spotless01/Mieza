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
router.post("/register", registerShop);

// Get approved shops
router.get("/", getApprovedShops);

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

      const image =
  req.file
    ? `https://mieza.onrender.com/uploads/${req.file.filename}`
    : "";

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

module.exports = router;