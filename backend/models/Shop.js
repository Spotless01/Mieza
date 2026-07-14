const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 🆕 Product Schema
const productSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true
      },

      price: {
        type: Number,
        required: true,
        min: 0
      },

      description: {
        type: String,
        default: "",
        trim: true
      },

      // Kept for old products and compatibility
      image: {
        type: String,
        default: ""
      },

      // New multiple product images
      images: {
        type: [String],
        default: []
      }
    },
    {
      timestamps: true
    }
  );

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true, index: true },
  ownerName: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  phone: { type: String, required: true },

  shopLocation: {type: String, default: ""},

  latitude: {type: Number},

  longitude: {type: Number},  

  password: { type: String, required: true },

  registrationFee: { type: Number, default: 0},

  payoutMethod: {
  type: String,
  enum: ["momo", "bank"],
  default: "momo"
},

momoNumber: {
  type: String,
  default: ""
},

momoName: {
  type: String,
  default: ""
},

momoNetwork: {
  type: String,
  default: ""
},

bankName: {
  type: String,
  default: ""
},

accountName: {
  type: String,
  default: ""
},

accountNumber: {
  type: String,
  default: ""
},

bankCode: {
  type: String,
  default: ""
},

momoBankCode: {
  type: String,
  default: ""
},

// Direct Transfer Recipient
paystackRecipientCode: {
  type: String,
  default: ""
},

// Paystack Split Subaccount
paystackSubaccountCode: {
  type: String,
  default: ""
},

// Percentage Paystack sends to vendor
paystackSplitPercentage: {
  type: Number,
  default: 90
},

// Indicates whether vendor has been
// registered on Paystack
paystackRegistered: {
  type: Boolean,
  default: false
},


autoPayoutEnabled: {
  type: Boolean,
  default: true
},

  // 🔥 Frontend display fields
  thumbnail: { type: String, default: "" },

  openingHours: {
    open: { type: String, default: "08:00" },
    close: { type: String, default: "22:00" }
  },

  paystackReference: { type: String, unique: true },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  commissionRate: { type: Number, default: 10 },

  // 🆕 Products
  products: {
    type: [productSchema],
    default: []
  }

}, { timestamps: true });

// 🔐 Hash password
shopSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("Shop", shopSchema);