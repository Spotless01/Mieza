const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema({

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    }

  }, {
    timestamps: true
  });

module.exports =
  mongoose.model(
    "Notification",
    notificationSchema
  );