const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({

  productId: String,

  name: String,

  price: Number,

  image: String,

  quantity: {
    type: Number,
    default: 1
  }

});

const orderSchema = new mongoose.Schema({

  customerName: {
    type: String,
    required: true
  },

  customerPhone: {
    type: String,
    required: true
  },

  customerEmail: {
  type: String,
  required: true
},

  customerAddress: {
    type: String,
    required: true
  },

  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },

  items: [orderItemSchema],

subtotal: {
  type: Number,
  required: true,
  default: 0
},

deliveryFee: {
  type: Number,
  required: true,
  default: 0
},

totalAmount: {
  type: Number,
  required: true
},

deliveryFee: {
  type: Number,
  default: 0
},


  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "delivered",
      "cancelled"
    ],
    default: "pending"
  },

  customerNotifications: [
  {
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
],

}, { timestamps: true });

module.exports =
  mongoose.model("Order", orderSchema);