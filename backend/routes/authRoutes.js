const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Shop = require("../models/Shop");

const router = express.Router();

// ===============================
// REGISTER SHOP OWNER
// ===============================
router.post("/register", async (req, res) => {

  try {

    let {
      shopName,
      ownerName,
      email,
      phone,
      password
    } = req.body;

    email = email.trim().toLowerCase();

    // CHECK EXISTING EMAIL
    const existingShop = await Shop.findOne({ email });

    if (existingShop) {

      return res.status(400).json({
        message: "Email already exists"
      });

    }

    // HASH PASSWORD
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // CREATE SHOP
    const shop = new Shop({

      shopName,
      ownerName,
      email,
      phone,

      password: hashedPassword

    });

    await shop.save();

    res.status(201).json({
      message: "Registration successful"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }

});

// ===============================
// LOGIN SHOP OWNER
// ===============================
router.post("/login", async (req, res) => {

  try {

    const email =
      req.body.email
        .trim()
        .toLowerCase();

    const password =
      req.body.password.trim();

    console.log("LOGIN EMAIL:", email);

    // FIND SHOP
    const shop =
      await Shop.findOne({ email });

    console.log("FOUND SHOP:", shop);

    if (!shop) {

      return res.status(400).json({
        message:
          "Invalid email or password"
      });

    }

    console.log(
      "STORED PASSWORD:",
      shop.password
    );

    // CHECK PASSWORD
    const isMatch =
      await bcrypt.compare(
        password,
        shop.password
      );

    console.log(
      "PASSWORD MATCH:",
      isMatch
    );

    if (!isMatch) {

      return res.status(400).json({
        message:
          "Invalid email or password"
      });

    }

    // TOKEN
    const token = jwt.sign(

      {
        shopId: shop._id
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d"
      }

    );

    res.json({

      token,

      shop: {

        id: shop._id,

        shopName:
          shop.shopName,

        email:
          shop.email

      }

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;