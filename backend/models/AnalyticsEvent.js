const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema({
  visitorHash: { type: String, required: true, index: true },
  sessionHash: { type: String, required: true, index: true },
  eventType: { type: String, enum: ["page_view"], default: "page_view", index: true },
  page: { type: String, required: true, maxlength: 200 },
  source: { type: String, default: "Direct", maxlength: 100 },
  referrerHost: { type: String, default: "" },
  country: { type: String, default: "Unknown", maxlength: 80 },
  region: { type: String, default: "", maxlength: 80 },
  city: { type: String, default: "", maxlength: 100 },
  device: { type: String, enum: ["Mobile", "Desktop", "Tablet", "Unknown"], default: "Unknown" },
  createdAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date, required: true }
}, { versionKey: false });

analyticsEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
analyticsEventSchema.index({ createdAt: -1, page: 1 });

module.exports = mongoose.model("AnalyticsEvent", analyticsEventSchema);
