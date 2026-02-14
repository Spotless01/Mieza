const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    name: String,
    price: Number,
    image: String,
    inStock: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
