const mongoose = require("mongoose");

const settlementSchema =
new mongoose.Schema({

  settlementType: {
    type: String,
    enum: [
      "vendor",
      "rider"
    ],
    required: true
  },

  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    default: null
  },

  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
    default: null
  },

  amountPaid: {
    type: Number,
    required: true
  },

  payoutMethod: {
    type: String,
    default: "momo"
  },

  status: {
    type: String,
    enum: [
      "completed",
      "failed"
    ],
    default: "completed"
  },

  notes: {
    type: String,
    default: ""
  }

},
{
  timestamps: true
});

module.exports =
mongoose.model(
  "Settlement",
  settlementSchema
);