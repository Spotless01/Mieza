const paystack = require("../config/paystack");
const Shop = require("../models/Shop");
const bcrypt = require("bcryptjs");

// REGISTER SHOP (Paystack verified)
exports.registerShop = async (req, res) => {
  try {
    const { reference, shopName, ownerName, email, phone, password } = req.body;

    if (!reference || !shopName || !ownerName || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Prevent reused payment
    const used = await Shop.findOne({ paystackReference: reference });
    if (used) {
      return res.status(409).json({ message: "Payment already used" });
    }

    // Verify Paystack
    const verifyRes = await paystack.get(`/transaction/verify/${reference}`);
    const payment = verifyRes.data.data;

    if (!payment || payment.status !== "success") {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    if (payment.amount / 100 !== 200 || payment.currency !== "GHS") {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const exists = await Shop.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const shop = await Shop.create({
      shopName,
      ownerName,
      email,
      phone,
      password,
      paystackReference: reference,
      isApproved: false
    });

    res.status(201).json({
      message: "Shop registered successfully. Awaiting approval.",
      shop
    });

  } catch (err) {
    console.error("Register shop error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET APPROVED SHOPS
exports.getApprovedShops = async (req, res) => {
  try {
    const shops = await Shop.find({
      isApproved: true,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// APPROVE SHOP (ADMIN)
exports.approveShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json({ message: "Shop approved", shop });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
