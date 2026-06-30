const mongoose = require("mongoose");

const payoutRunSchema =
new mongoose.Schema(
  {
    runDate: {
      type: String,
      required: true,
      unique: true
    },

    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running"
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports =
mongoose.model("PayoutRun", payoutRunSchema);