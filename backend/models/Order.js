const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({

  productId: String,

  name: String,

  price: Number,

  image: String,

  quantity: {
    type: Number,
    default: 1
  }

});

const orderSchema = new mongoose.Schema({

  customerName: {
    type: String,
    required: true
  },

  customerPhone: {
    type: String,
    required: true
  },

  customerEmail: {
    type: String,
    required: true
  },

  customerAddress: {
  type: String,
  required: true
},

customerLatitude: {
  type: Number,
  default: null
},

customerLongitude: {
  type: Number,
  default: null
},

riderLatitude: {
  type: Number,
  default: null
},

riderLongitude: {
  type: Number,
  default: null
},

deliveryStarted: {
  type: Boolean,
  default: false
},

riderName: {
  type: String,
  default: null
},

riderPhone: {
  type: String,
  default: null
},

riderId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Rider",
  default: null
},

assignedRiderId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Rider",
  default: null
},

riderAcceptanceStatus: {
  type: String,
  enum: ["pending", "accepted", "rejected", "expired"],
  default: "pending"
},

riderDispatchStartedAt: Date,

acceptedByRider: {
  type: Boolean,
  default: false
},

deliveryPin: {
  type: String,
  default: null
},

deliveryPinVerified: {
  type: Boolean,
  default: false
},

deliveryPinVerifiedAt: {
  type: Date,
  default: null
},

deliveredAt: {
  type: Date,
  default: null
},

shopId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Shop",
  required: true
},

  items: [orderItemSchema],

  subtotal: {
    type: Number,
    required: true,
    default: 0
  },

 deliveryFee: {
  type: Number,
  required: true,
  default: 0
},

deliveryCommission: {
  type: Number,
  default: 0
},

riderEarnings: {
  type: Number,
  default: 0
},

distanceKm: {
  type: Number,
  default: 0
},

estimatedDeliveryMinutes: {
  type: Number,
  default: 0
},

  totalAmount: {
    type: Number,
    required: true
  },

  commissionRevenue: {
  type: Number,
  default: 0
},

vendorRevenue: {
  type: Number,
  default: 0
},

settlementStatus: {
  type: String,
  enum: [
    "pending",
    "paid"
  ],
  default: "pending"
},

riderSettlementStatus: {
  type: String,
  enum: [
    "pending",
    "paid"
  ],
  default: "pending"
},

vendorCommissionStatus: {
  type: String,
  enum: ["pending", "paid"],
  default: "pending"
},

vendorCommissionPaidAt: {
  type: Date,
  default: null
},

riderCommissionStatus: {
  type: String,
  enum: ["pending", "paid"],
  default: "pending"
},

riderCommissionPaidAt: {
  type: Date,
  default: null
},

paymentMethod: {
  type: String,
  enum: [
    "vendor_direct_momo",
    "vendor_direct_bank"
  ],
  default: "vendor_direct_momo"
},

paymentReference: {
  type: String,
  default: ""
},

paymentInstructionReference: {
  type: String,
  default: ""
},

paymentStatus: {
  type: String,
  enum: [
    "awaiting_customer_payment",
    "awaiting_vendor_confirmation",
    "confirmed",
    "rejected"
  ],
  default: "awaiting_vendor_confirmation"
},

vendorPaymentConfirmedAt: {
  type: Date,
  default: null
},

deliveryPaymentMethod: {
  type: String,
  enum: ["cash_to_rider"],
  default: "cash_to_rider"
},

deliveryFeeCollected: {
  type: Boolean,
  default: false
},

  status: {
    type: String,
    enum: [

  "pending",

  "awaiting_vendor_confirmation",

  "processing",

  "ready_for_pickup",

  "assigned_to_rider",

  "out_for_delivery",

  "delivered",

  "cancelled"

],
    default: "pending"
  },

  customerNotifications: [
    {
      message: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, { timestamps: true });

module.exports =
  mongoose.model("Order", orderSchema);