const mongoose =
  require("mongoose");

const bcrypt =
  require("bcryptjs");


const riderSchema =
  new mongoose.Schema(

    {

      // ==================================
      // BASIC INFORMATION
      // ==================================

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


      // ==================================
      // PROFILE PHOTO
      // ==================================

      profilePhoto: {

        type: String,

        default: ""

      },


      // ==================================
      // GHANA CARD
      // ==================================

      nationalIdNumber: {

        type: String,

        default: "",

        trim: true

      },


      // ==================================
      // LOCATION
      // ==================================

      currentLocation: {

        type: String,

        default: ""

      },


      currentLatitude: {

        type: Number,

        default: null

      },


      currentLongitude: {

        type: Number,

        default: null

      },


      // ==================================
      // VEHICLE
      // ==================================

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

        default: ""

      },


      vehicleBrand: {

        type: String,

        default: ""

      },


      vehicleModel: {

        type: String,

        default: ""

      },


      vehicleColor: {

        type: String,

        default: ""

      },


      plateNumber: {

        type: String,

        default: ""

      },


      // ==================================
      // VEHICLE PHOTOS
      // ==================================

      vehiclePhotos: {

        type: [String],

        default: []

      },


      // ==================================
      // REGISTRATION
      // ==================================

      registrationFee: {

        type: Number,

        default: 100

      },


      paystackReference: {

        type: String,

        unique: true

      },


      // ==================================
      // STATUS
      // ==================================

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


      // ==================================
      // PAYOUT
      // ==================================

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


      momoBankCode: {

        type: String,

        default: ""

      },


      bankName: {

        type: String,

        default: ""

      },


      bankCode: {

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


// ======================================
// HASH PASSWORD
// ======================================

riderSchema.pre(
  "save",

  async function () {

    if (
      !this.isModified("password")
    ) {

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