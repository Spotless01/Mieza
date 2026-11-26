const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  description: { type: String, required: true, trim: true, maxlength: 1200 },
  providerName: { type: String, default: "Mieza verified service partner", trim: true, maxlength: 100 },
  location: { type: String, default: "Obuasi, Ghana", trim: true, maxlength: 120 },
  image: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
