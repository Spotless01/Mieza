const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  paystackReference: { type: String, unique: true },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  commissionRate: { type: Number, default: 10 }
}, { timestamps: true });


// 🔐 Hash password
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Shop", shopSchema);
paystackReference: { type: String, unique: true },
