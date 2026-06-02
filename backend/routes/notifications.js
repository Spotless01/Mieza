const express = require("express");
const router = express.Router();

const Notification =
  require("../models/Notification");

const authMiddleware =
  require("../middleware/authMiddleware");

// Vendor notifications
router.get(
  "/shop",
  authMiddleware,
  async (req, res) => {

    try {

      const notifications =
        await Notification.find({

          shopId: req.shopId,

          await Notification.find({
          shopId: req.shopId
          })

        })
        .sort({ createdAt: -1 });

      res.json(notifications);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// MARK NOTIFICATION AS READ
// ====================================

router.put(
  "/:notificationId/read",
  authMiddleware,
  async (req, res) => {

    try {

      await Notification.findByIdAndDelete(
        req.params.notificationId
      );

      res.json({
        success: true
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// Admin notifications
router.get(
  "/admin",
  async (req, res) => {

    try {

      const notifications =
        await Notification.find({
          shopId: null
        })
        .sort({ createdAt: -1 });

      res.json(notifications);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

module.exports = router;