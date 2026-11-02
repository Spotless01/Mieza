const mongoose = require("mongoose");

const settlementSchema =
new mongoose.Schema({

  settlementType: {
  type: String,
  enum: [
    "vendor",
    "rider",
    "vendor_commission",
    "rider_commission",
    "ride_driver"
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

  rideDriverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RideDriver",
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
      "pending",
      "completed",
      "failed"
    ],
    default: "pending"
  },

  paystackTransferReference: {
  type: String,
  default: ""
},

paystackTransferCode: {
  type: String,
  default: ""
},

paystackStatus: {
  type: String,
  default: ""
},

orders: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  }
],

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