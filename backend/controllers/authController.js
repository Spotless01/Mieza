const Shop = require("../models/Shop");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginShop = async (req, res) => {
  const { email, password } = req.body;

  const shop = await Shop.findOne({ email });
  if (!shop) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, shop.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  if (!shop.isApproved) {
    return res.status(403).json({ message: "Shop not approved yet" });
  }

  const token = jwt.sign(
    { shopId: shop._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    shop: {
      id: shop._id,
      shopName: shop.shopName
    }
  });
};
