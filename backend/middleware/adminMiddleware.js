const jwt =
  require("jsonwebtoken");

const Admin =
  require("../models/Admin");

module.exports =
  async (req, res, next) => {

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {

      return res.status(401).json({
        message:
          "Admin authentication required"
      });

    }

    const token =
      authHeader
        .split(" ")[1];

    if (!token) {

      return res.status(401).json({
        message:
          "No admin token provided"
      });

    }

    try {

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      if (
        !decoded.admin ||
        !decoded.adminId
      ) {

        return res.status(403).json({
          message:
            "Invalid admin account"
        });

      }

      const admin =
        await Admin.findById(
          decoded.adminId
        ).select(
          "_id name email role isActive"
        );

      if (!admin) {

        return res.status(401).json({
          message:
            "Admin account no longer exists"
        });

      }

      if (!admin.isActive) {

        return res.status(403).json({
          message:
            "This admin account is disabled"
        });

      }

      req.admin = {
        id:
          admin._id.toString(),

        name:
          admin.name,

        email:
          admin.email,

        role:
          admin.role
      };

      next();

    } catch (err) {

      console.log(
        "Admin authentication error:",
        err.message
      );

      return res.status(401).json({
        message:
          "Invalid or expired admin token"
      });

    }

  };