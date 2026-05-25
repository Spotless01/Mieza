const express = require("express");
const router = express.Router();

const Shop = require("../models/Shop");

// =====================================
// 🛍️ GET ALL MARKETPLACE PRODUCTS
// =====================================

router.get("/products", async (req, res) => {

  try {

    // Get approved active shops
    const shops = await Shop.find({
      isApproved: true,
      isActive: true
    });

    let allProducts = [];

    shops.forEach(shop => {

      const products = shop.products.map(product => ({

        ...product.toObject(),

        shopId: shop._id,

        shopName: shop.shopName,

        thumbnail: shop.thumbnail

      }));

      allProducts.push(...products);
    });

    res.json(allProducts);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;