const mongoose = require("mongoose");

const analyticsVisitorSchema = new mongoose.Schema({
  visitorHash: { type: String, required: true, unique: true, index: true },
  firstSeenAt: { type: Date, required: true, default: Date.now, index: true },
  lastSeenAt: { type: Date, required: true, default: Date.now, index: true },
  firstCountry: { type: String, default: "Unknown" },
  lastCountry: { type: String, default: "Unknown" },
  firstCity: { type: String, default: "" },
  lastCity: { type: String, default: "" },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

analyticsVisitorSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AnalyticsVisitor", analyticsVisitorSchema);
