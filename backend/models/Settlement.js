const mongoose = require("mongoose");

const settlementSchema =
new mongoose.Schema({

  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
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