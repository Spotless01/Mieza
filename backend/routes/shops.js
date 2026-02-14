const express = require("express");
const router = express.Router();

const {
  registerShop,
  getApprovedShops,
  approveShop
} = require("../controllers/shopController");

// Register shop (after Paystack payment)
router.post("/register", registerShop);

// Get approved shops (PUBLIC)
router.get("/", getApprovedShops);

// Approve shop (ADMIN – later protect with auth)
router.put("/approve/:id", approveShop);

module.exports = router;
