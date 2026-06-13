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

acceptedByRider: {
  type: Boolean,
  default: false
},

shopId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Shop",
  required: true
},

riderId: {

  type:
  mongoose.Schema.Types.ObjectId,

  ref: "Rider",

  default: null

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

  status: {
    type: String,
    enum: [

  "pending",

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