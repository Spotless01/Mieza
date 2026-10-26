const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required."
      });
    }

    const token = authHeader.split(" ")[1];



    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.customerId) {
      return res.status(401).json({
        message: "Invalid customer token."
      });
    }

    const customer = await Customer.findById(
      decoded.customerId
    ).select("-password");

    if (!customer) {
      return res.status(401).json({
        message: "Customer account not found."
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: "Customer account is inactive."
      });
    }

    req.customerId = customer._id;
    req.customer = customer;

    next();

  } catch (error) {
    console.error("Customer authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired authentication token."
    });
  }
};