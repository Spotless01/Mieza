const express = require("express");

const router = express.Router();

const Order =
  require("../models/Order");

router.get(
  "/:orderId",
  async (req, res) => {

    try {

      const order =
        await Order.findById(
          req.params.orderId
        );

      if (!order) {

        return res.status(404).json({
          message:
            "Order not found"
        });

      }

      res.json({

        status:
          order.status,

        notifications:
          order.customerNotifications,

        customer:
          order.customerName,

        total:
          order.totalAmount

      });

    } catch (err) {

      res.status(500).json({
        message:
          err.message
      });

    }

  }
);

module.exports = router;