const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

// =====================================================
// Generate JWT
// =====================================================

const generateToken = (customer) => {
  return jwt.sign(
    {
      customerId: customer._id,
      role: "customer"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d"
    }
  );
};

// =====================================================
// REGISTER CUSTOMER
// =====================================================

exports.registerCustomer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password
    } = req.body;

    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        message: "Full name, email, phone and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------------------------
    // Check duplicate email
    // -----------------------------------------------

    const existingCustomer = await Customer.findOne({
      email: normalizedEmail
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    // -----------------------------------------------
    // Create customer
    // -----------------------------------------------

    const customer = await Customer.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password
    });

    // -----------------------------------------------
    // Generate token
    // -----------------------------------------------

    const token = generateToken(customer);

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    res.status(201).json({
      message: "Customer account created successfully.",
      token,

      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        profilePhoto: customer.profilePhoto,
        isVerified: customer.isVerified
      }
    });

  } catch (error) {
    console.error("Customer registration error:", error);

    res.status(500).json({
      message: "Server error while creating customer account."
    });
  }
};

// =====================================================
// LOGIN CUSTOMER
// =====================================================

exports.loginCustomer = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------------------------
    // Find customer
    // -----------------------------------------------

    const customer = await Customer.findOne({
      email: normalizedEmail
    });

    if (!customer) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    // -----------------------------------------------
    // Check account status
    // -----------------------------------------------

    if (!customer.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated."
      });
    }

    // -----------------------------------------------
    // Verify password
    // -----------------------------------------------

    const passwordMatches = await customer.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    // -----------------------------------------------
    // Generate token
    // -----------------------------------------------

    const token = generateToken(customer);

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    res.json({
      message: "Login successful.",
      token,

      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        profilePhoto: customer.profilePhoto,
        isVerified: customer.isVerified
      }
    });

  } catch (error) {
    console.error("Customer login error:", error);

    res.status(500).json({
      message: "Server error while logging in."
    });
  }
};

// =====================================================
// GET CUSTOMER PROFILE
// =====================================================

exports.getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId)
      .select("-password");

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found."
      });
    }

    res.json({
      customer
    });

  } catch (error) {
    console.error("Get customer profile error:", error);

    res.status(500).json({
      message: "Server error."
    });
  }
};

// =====================================================
// UPDATE CUSTOMER PROFILE
// =====================================================

exports.updateCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found."
      });
    }

    const {
      fullName,
      phone,
      profilePhoto
    } = req.body;

    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({
          message: "Full name cannot be empty."
        });
      }

      customer.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        return res.status(400).json({
          message: "Phone number cannot be empty."
        });
      }

      customer.phone = phone.trim();
    }

    if (profilePhoto !== undefined) {
      customer.profilePhoto = profilePhoto;
    }

    await customer.save();

    res.json({
      message: "Profile updated successfully.",
      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        profilePhoto: customer.profilePhoto,
        isVerified: customer.isVerified
      }
    });

  } catch (error) {
    console.error("Update customer profile error:", error);

    res.status(500).json({
      message: "Server error."
    });
  }
};