const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Shop = require("../models/Shop");
const Rider = require("../models/Rider");
const RideDriver = require("../models/RideDriver");
const sendEmail = require("../config/brevo");

const router = express.Router();
const ACCOUNT_MODELS = { shop: Shop, rider: Rider, rideDriver: RideDriver };
const GENERIC_MESSAGE = "If an account with that email exists, a password reset link has been sent.";
const FRONTEND_URL = (process.env.FRONTEND_URL || "https://miezadelivery.com").replace(/\/$/, "");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function safeAccountType(value) {
  return Object.prototype.hasOwnProperty.call(ACCOUNT_MODELS, value) ? value : null;
}

router.post("/request", async (req, res) => {
  try {
    const accountType = safeAccountType(req.body.accountType);
    const email = normalizeEmail(req.body.email);
    if (!accountType || !email || email.length > 254) {
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    const Model = ACCOUNT_MODELS[accountType];
    const account = await Model.findOne({ email });
    if (!account) return res.json({ message: GENERIC_MESSAGE });

    const rawToken = crypto.randomBytes(32).toString("hex");
    account.passwordResetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    account.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await account.save();

    const resetUrl = `${FRONTEND_URL}/reset-password.html?type=${encodeURIComponent(accountType)}&token=${encodeURIComponent(rawToken)}`;
    const name = account.shopName || account.fullName || "there";
    await sendEmail(
      email,
      "Reset your Mieza password",
      `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033"><h2>Reset your Mieza password</h2><p>Hello ${String(name).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))},</p><p>We received a request to reset the password for your Mieza account.</p><p><a href="${resetUrl}" style="display:inline-block;padding:13px 20px;background:#0b5cff;color:#fff;text-decoration:none;border-radius:8px">Create a new password</a></p><p>This link expires in 15 minutes and can only be used once. If you did not request this, you can ignore this email.</p><p>If the button does not work, copy this link into your browser:<br>${resetUrl}</p></div>`
    );

    return res.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Password reset request error:", error.response?.data || error.message);
    return res.status(200).json({ message: GENERIC_MESSAGE });
  }
});

router.post("/confirm", async (req, res) => {
  try {
    const accountType = safeAccountType(req.body.accountType);
    const token = String(req.body.token || "").trim();
    const password = String(req.body.password || "");
    if (!accountType || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ message: "This reset link is invalid or has expired. Request a new one." });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Your new password must be between 8 and 128 characters." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const Model = ACCOUNT_MODELS[accountType];
    const account = await Model.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() }
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!account) {
      return res.status(400).json({ message: "This reset link is invalid or has expired. Request a new one." });
    }

    account.password = password;
    account.passwordResetTokenHash = null;
    account.passwordResetExpiresAt = null;
    await account.save();

    return res.json({ message: "Your password has been changed. You can now log in with your new password." });
  } catch (error) {
    console.error("Password reset confirmation error:", error.message);
    return res.status(500).json({ message: "We could not reset your password. Please try again." });
  }
});

module.exports = router;
