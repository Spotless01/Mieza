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

  const adminMiddleware =
  require(
    "../middleware/adminMiddleware"
  );

// ====================================
// CREATE INITIAL OWNER FROM ENV
// ====================================

async function ensureOwnerAccount() {

  const ownerEmail =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

      const ownerPhone =
  String(
    process.env.ADMIN_PHONE || ""
  ).trim();

  const ownerPassword =
    process.env.ADMIN_PASSWORD;

  if (
  !ownerEmail ||
  !ownerPassword ||
  !ownerPhone
) {
  console.log(
    "ADMIN_EMAIL, ADMIN_PASSWORD or ADMIN_PHONE is missing."
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

          phone:
      ownerPhone,

        password:
          hashedPassword,

        role:
          "owner",

        isActive:
          true,

          mustChangePassword: false
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

    if (
  owner.phone !== ownerPhone
) {
  owner.phone = ownerPhone;
  changed = true;
}

    if (
  owner.mustChangePassword !== false
) {
  owner.mustChangePassword = false;
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
      admin.role,

    mustChangePassword:
      admin.mustChangePassword === true
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
// CHANGE ADMIN PASSWORD
// ====================================

router.put(
  "/change-password",
  adminMiddleware,
  async (req, res) => {

    try {

      const currentPassword =
        String(
          req.body.currentPassword || ""
        );

      const newPassword =
        String(
          req.body.newPassword || ""
        );

      const confirmPassword =
        String(
          req.body.confirmPassword || ""
        );

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {

        return res.status(400).json({
          message:
            "Current password, new password and confirmation are required"
        });

      }

      if (
        newPassword !==
        confirmPassword
      ) {

        return res.status(400).json({
          message:
            "New passwords do not match"
        });

      }

      if (
        newPassword.length < 8
      ) {

        return res.status(400).json({
          message:
            "New password must be at least 8 characters"
        });

      }

      if (
        currentPassword ===
        newPassword
      ) {

        return res.status(400).json({
          message:
            "Your new password must be different from your current password"
        });

      }

      const admin =
        await Admin.findById(
          req.admin.id
        ).select("+password");

      if (!admin) {

        return res.status(404).json({
          message:
            "Admin account not found"
        });

      }

      if (!admin.isActive) {

        return res.status(403).json({
          message:
            "This admin account is disabled"
        });

      }

      const currentPasswordMatches =
        await bcrypt.compare(
          currentPassword,
          admin.password
        );

      if (
        !currentPasswordMatches
      ) {

        return res.status(401).json({
          message:
            "Current password is incorrect"
        });

      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          12
        );

      admin.password =
        hashedPassword;

      admin.mustChangePassword =
        false;

      await admin.save();

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

      res.json({
        message:
          "Password changed successfully",

        token,

        admin: {
          id:
            admin._id,

          name:
            admin.name,

          email:
            admin.email,

          role:
            admin.role,

          mustChangePassword:
            false
        }
      });

    } catch (err) {

      console.log(
        "Admin password change error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to change password"
      });

    }

  }
);


// ====================================
// CURRENT ADMIN PROFILE
// ====================================

router.get(
  "/me",
  adminMiddleware,
  async (req, res) => {

    try {

      const admin =
        await Admin.findById(
          req.admin.id
        ).select(
          "_id name email role isActive mustChangePassword"
        );

      if (!admin) {

        return res.status(404).json({
          message:
            "Admin account not found"
        });

      }

      res.json({
        admin: {
          id:
            admin._id,

          name:
            admin.name,

          email:
            admin.email,

          role:
            admin.role,

          mustChangePassword:
            admin.mustChangePassword === true
        }
      });

    } catch (err) {

      res.status(500).json({
        message:
          "Unable to load admin profile"
      });

    }

  }
);

module.exports =
  router;