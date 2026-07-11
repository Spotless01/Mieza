const express =
  require("express");

const jwt =
  require("jsonwebtoken");

const bcrypt =
  require("bcryptjs");

const Admin =
  require("../models/Admin");

const router =
  express.Router();

// ====================================
// CREATE INITIAL OWNER FROM ENV
// ====================================

async function ensureOwnerAccount() {

  const ownerEmail =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const ownerPassword =
    process.env.ADMIN_PASSWORD;

  if (
    !ownerEmail ||
    !ownerPassword
  ) {
    console.log(
      "ADMIN_EMAIL or ADMIN_PASSWORD is missing."
    );

    return null;
  }

  let owner =
    await Admin.findOne({
      email: ownerEmail
    }).select("+password");

  if (!owner) {

    const hashedPassword =
      await bcrypt.hash(
        ownerPassword,
        12
      );

    owner =
      await Admin.create({
        name:
          process.env.ADMIN_NAME ||
          "Mieza Owner",

        email:
          ownerEmail,

        password:
          hashedPassword,

        role:
          "owner",

        isActive:
          true
      });

    console.log(
      "Initial Mieza owner account created."
    );

  } else {

    let changed = false;

    if (owner.role !== "owner") {
      owner.role = "owner";
      changed = true;
    }

    if (!owner.isActive) {
      owner.isActive = true;
      changed = true;
    }

    if (changed) {
      await owner.save();
    }

  }

  return owner;
}

// ====================================
// ADMIN LOGIN
// ====================================

router.post(
  "/login",
  async (req, res) => {

    try {

      const email =
        String(
          req.body.email || ""
        )
          .trim()
          .toLowerCase();

      const password =
        String(
          req.body.password || ""
        );

      if (!email || !password) {

        return res.status(400).json({
          message:
            "Email and password are required"
        });

      }

      // Ensures your existing owner
      // credentials are migrated to MongoDB.
      await ensureOwnerAccount();

      const admin =
        await Admin.findOne({
          email
        }).select("+password");

      if (!admin) {

        return res.status(401).json({
          message:
            "Invalid credentials"
        });

      }

      if (!admin.isActive) {

        return res.status(403).json({
          message:
            "This admin account has been disabled"
        });

      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          admin.password
        );

      if (!passwordMatches) {

        return res.status(401).json({
          message:
            "Invalid credentials"
        });

      }

      const token =
        jwt.sign(
          {
            adminId:
              admin._id.toString(),

            role:
              admin.role,

            admin:
              true
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "7d"
          }
        );

      admin.lastLoginAt =
        new Date();

      await admin.save();

      res.json({
        token,

        admin: {
          id:
            admin._id,

          name:
            admin.name,

          email:
            admin.email,

          role:
            admin.role
        }
      });

    } catch (err) {

      console.log(
        "Admin login error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to log in"
      });

    }

  }
);

// ====================================
// CURRENT ADMIN PROFILE
// ====================================

router.get(
  "/me",
  require("../middleware/adminMiddleware"),
  async (req, res) => {

    res.json({
      admin: req.admin
    });

  }
);

module.exports =
  router;