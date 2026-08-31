const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const riderSchema = new mongoose.Schema(
  {
    // =====================================
    // BASIC INFORMATION
    // =====================================

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // =====================================
    // RIDER PROFILE
    // =====================================

    profilePhoto: {
      type: String,
      default: ""
    },

    nationalIdNumber: {
      type: String,
      default: "",
      trim: true
    },

    // =====================================
    // LOCATION
    // =====================================

    currentLocation: {
      type: String,
      default: "",
      trim: true
    },

    currentLatitude: {
      type: Number,
      default: null
    },

    currentLongitude: {
      type: Number,
      default: null
    },

    // =====================================
    // VEHICLE
    // =====================================

    vehicleType: {
      type: String,

      enum: [
        "motorbike",
        "car",
        "bicycle"
      ],

      default: "motorbike"
    },

    driverLicenseNumber: {
      type: String,
      default: "",
      trim: true
    },

    vehicleBrand: {
      type: String,
      default: "",
      trim: true
    },

    vehicleModel: {
      type: String,
      default: "",
      trim: true
    },

    vehicleColor: {
      type: String,
      default: "",
      trim: true
    },

    plateNumber: {
      type: String,
      default: "",
      trim: true
    },

    vehiclePhotos: {
      type: [String],
      default: []
    },

    // =====================================
    // REGISTRATION PAYMENT
    // =====================================

    registrationFee: {
      type: Number,
      default: 100
    },

    paystackReference: {
      type: String,
      unique: true
    },

    // =====================================
    // ACCOUNT STATUS
    // =====================================

    isApproved: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isAvailable: {
      type: Boolean,
      default: true
    },

    // =====================================
    // PAYOUT INFORMATION
    // =====================================

    payoutMethod: {
      type: String,

      enum: [
        "momo",
        "bank"
      ],

      default: "momo"
    },

    momoNumber: {
      type: String,
      default: "",
      trim: true
    },

    momoName: {
      type: String,
      default: "",
      trim: true
    },

    momoNetwork: {
      type: String,
      default: "",
      trim: true
    },

    momoBankCode: {
      type: String,
      default: "",
      trim: true
    },

    bankName: {
      type: String,
      default: "",
      trim: true
    },

    bankCode: {
      type: String,
      default: "",
      trim: true
    },

    accountName: {
      type: String,
      default: "",
      trim: true
    },

    accountNumber: {
      type: String,
      default: "",
      trim: true
    },

    paystackRecipientCode: {
      type: String,
      default: ""
    },

    autoPayoutEnabled: {
      type: Boolean,
      default: true
    }
  },

  {
    timestamps: true
  }
);


// =====================================
// HASH PASSWORD BEFORE SAVE
// =====================================

riderSchema.pre(
  "save",
  async function () {

    if (!this.isModified("password")) {
      return;
    }

    this.password =
      await bcrypt.hash(
        this.password,
        10
      );
  }
);


module.exports =
  mongoose.model(
    "Rider",
    riderSchema
  );