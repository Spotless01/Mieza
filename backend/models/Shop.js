const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 🆕 Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  description: { type: String, default: "" }
}, { timestamps: true });

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true, index: true },
  ownerName: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  phone: { type: String, required: true },

  password: { type: String, required: true },

  registrationFee: { type: Number, default: 0},

  // 🔥 Frontend display fields
  thumbnail: { type: String, default: "" },

  openingHours: {
    open: { type: String, default: "08:00" },
    close: { type: String, default: "22:00" }
  },

  paystackReference: { type: String, unique: true },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  commissionRate: { type: Number, default: 10 },

  // 🆕 Products
  products: {
    type: [productSchema],
    default: []
  }

}, { timestamps: true });

// 🔐 Hash password
shopSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("Shop", shopSchema);