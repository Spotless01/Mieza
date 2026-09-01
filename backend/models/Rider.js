const mongoose =
  require("mongoose");

const bcrypt =
  require("bcryptjs");


const riderSchema =
  new mongoose.Schema(

    {

      // ======================================
      // PERSONAL
      // ======================================

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


      // ======================================
      // PROFILE PHOTO
      // ======================================

      profilePhoto: {

        type: String,

        default: ""

      },


      // ======================================
      // LOCATION
      // ======================================

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


      // ======================================
      // GHANA CARD
      // ======================================

      nationalIdNumber: {

        type: String,

        default: "",

        trim: true

      },


      // ======================================
      // VEHICLE
      // ======================================

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


      // ======================================
      // VEHICLE PHOTOS
      // ======================================

      vehiclePhotos: {

        type: [String],

        default: []

      },


      // ======================================
      // REGISTRATION PAYMENT
      // ======================================

      registrationFee: {

        type: Number,

        default: 100

      },

      paystackReference: {

        type: String,

        unique: true,

        sparse: true

      },


      // ======================================
      // ACCOUNT STATUS
      // ======================================

      isApproved: {

        type: Boolean,

        default: false

      },

      isActive: {

        type: Boolean,

        default: true

      },


      // ======================================
      // PAYOUT
      // ======================================

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


      // ======================================
      // PAYSTACK RECIPIENT
      // ======================================

      paystackRecipientCode: {

        type: String,

        default: ""

      },


      autoPayoutEnabled: {

        type: Boolean,

        default: true

      },


      // ======================================
      // AVAILABILITY
      // ======================================

      isAvailable: {

        type: Boolean,

        default: true

      }

    },

    {

      timestamps: true

    }

  );


// ==================================================
// HASH PASSWORD
// ==================================================

riderSchema.pre(
  "save",

  async function () {

    if (
      !this.isModified(
        "password"
      )
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