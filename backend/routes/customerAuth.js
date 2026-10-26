const express = require("express");

const router = express.Router();

const customerController = require("../controllers/customerController");
const customerMiddleware = require("../middleware/customerMiddleware");

// =====================================================
// PUBLIC CUSTOMER AUTH
// =====================================================

router.post(
  "/register",
  customerController.registerCustomer
);

router.post(
  "/login",
  customerController.loginCustomer
);

// =====================================================
// PROTECTED CUSTOMER ROUTES
// =====================================================

router.get(
  "/profile",
  customerMiddleware,
  customerController.getCustomerProfile
);

router.put(
  "/profile",
  customerMiddleware,
  customerController.updateCustomerProfile
);

module.exports = router;