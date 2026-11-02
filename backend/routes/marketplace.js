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

// Product detail also returns the seller and the seller's other products.
router.get("/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Prefer a direct embedded-document lookup. Fall back to a lean scan for
    // legacy records whose embedded IDs were serialized inconsistently.
    let shop = await Shop.findOne({
      ...PUBLIC_SHOP_FILTER,
      "products._id": productObjectId
    }).select("shopName thumbnail shopLocation openingHours products").lean();

    if (!shop) {
      const eligibleShops = await Shop.find(PUBLIC_SHOP_FILTER)
        .select("shopName thumbnail shopLocation openingHours products")
        .lean();
      shop = eligibleShops.find(item =>
        (item.products || []).some(p => String(p._id) === String(productId))
      );
    }

    if (!shop) {
      return res.status(404).json({ message: "Product not found in an approved and active shop", productId });
    }

    const product = (shop.products || []).find(p => String(p._id) === String(productId));
    const shopProducts = (shop.products || [])
      .filter(p => String(p._id) !== productId)
      .map(p => ({ ...p, _id: String(p._id), shopId: String(shop._id), shopName: shop.shopName, shopThumbnail: shop.thumbnail || "" }));

    res.json({
      product: {
        ...product,
        _id: String(product._id),
        shopId: String(shop._id),
        shopName: shop.shopName,
        shopThumbnail: shop.thumbnail || "",
        shopLocation: shop.shopLocation || ""
      },
      shop: {
        _id: String(shop._id),
        shopName: shop.shopName,
        thumbnail: shop.thumbnail || "",
        shopLocation: shop.shopLocation || "",
        openingHours: shop.openingHours || null
      },
      shopProducts
    });
  } catch (err) {
    console.error("Marketplace product detail error:", err);
    res.status(500).json({ message: "Unable to load product details" });
  }
});

module.exports = router;
