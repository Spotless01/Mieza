const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true
    },

    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null
    },

    customerName: {
      type: String,
      required: true
    },

    customerPhone: {
      type: String,
      required: true
    },

    shopRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    shopReview: {
      type: String,
      default: ""
    },

    riderRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    riderReview: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Review", reviewSchema);