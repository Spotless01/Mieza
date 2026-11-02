const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Shop = require("../models/Shop");

const PUBLIC_SHOP_FILTER = {
  isApproved: true,
  isActive: true
};

// Flatten approved vendors' products into one marketplace catalogue.
router.get("/products", async (req, res) => {
  try {
    const shops = await Shop.find(PUBLIC_SHOP_FILTER)
      .select("shopName thumbnail shopLocation openingHours products")
      .lean();

    const products = [];
    for (const shop of shops) {
      for (const product of (shop.products || [])) {
        products.push({
          ...product,
          _id: String(product._id),
          shopId: String(shop._id),
          shopName: shop.shopName,
          shopThumbnail: shop.thumbnail || "",
          shopLocation: shop.shopLocation || "",
          openingHours: shop.openingHours || null
        });
      }
    }

    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json(products);
  } catch (err) {
    console.error("Marketplace products error:", err);
    res.status(500).json({ message: "Unable to load marketplace products" });
  }
});

// Product detail resolves the embedded product through its vendor first when
// shopId is supplied. This avoids ambiguous scans and supports older links.
router.get("/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { shopId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const projection = "shopName thumbnail shopLocation openingHours products";
    let shop = null;
    if (shopId && mongoose.Types.ObjectId.isValid(shopId)) {
      shop = await Shop.findOne({ _id: shopId, ...PUBLIC_SHOP_FILTER })
        .select(projection).lean();
      if (shop && !(shop.products || []).some(p => String(p._id) === String(productId))) {
        shop = null;
      }
    }

    if (!shop) {
      shop = await Shop.findOne({ ...PUBLIC_SHOP_FILTER, "products._id": productId })
        .select(projection).lean();
    }
    if (!shop) {
      const candidates = await Shop.find(PUBLIC_SHOP_FILTER).select(projection).lean();
      shop = candidates.find(candidate =>
        (candidate.products || []).some(p => String(p._id) === String(productId))
      ) || null;
    }
    if (!shop) {
      return res.status(404).json({ message: "Product not found", productId, shopId: shopId || null });
    }

    const product = (shop.products || []).find(p => String(p._id) === String(productId));
    if (!product) return res.status(404).json({ message: "Product not found", productId });

    const shopProducts = (shop.products || [])
      .filter(p => String(p._id) !== String(productId))
      .map(p => ({ ...p, _id: String(p._id), shopId: String(shop._id), shopName: shop.shopName, shopThumbnail: shop.thumbnail || "" }));

    res.set("Cache-Control", "no-store");
    res.json({
      product: { ...product, _id: String(product._id), shopId: String(shop._id), shopName: shop.shopName, shopThumbnail: shop.thumbnail || "", shopLocation: shop.shopLocation || "" },
      shop: { _id: String(shop._id), shopName: shop.shopName, thumbnail: shop.thumbnail || "", shopLocation: shop.shopLocation || "", openingHours: shop.openingHours || null },
      shopProducts
    });
  } catch (err) {
    console.error("Marketplace product detail error:", err);
    res.status(500).json({ message: "Unable to load product details" });
  }
});

module.exports = router;
