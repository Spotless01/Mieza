const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema(
  {
    // =====================================================
    // BASIC CUSTOMER INFORMATION
    // =====================================================

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    profilePhoto: {
      type: String,
      default: ""
    },

    // =====================================================
    // CURRENT CUSTOMER LOCATION
    // =====================================================

    currentLocation: {
      address: {
        type: String,
        default: ""
      },

      latitude: {
        type: Number,
        default: null
      },

      longitude: {
        type: Number,
        default: null
      }
    },

    // =====================================================
    // SAVED CUSTOMER ADDRESSES
    // =====================================================

    savedAddresses: {
      type: [
        {
          label: {
            type: String,
            trim: true
          },

          address: {
            type: String,
            trim: true
          },

          latitude: {
            type: Number
          },

          longitude: {
            type: Number
          }
        }
      ],

      default: []
    },

    // =====================================================
    // ACCOUNT STATUS
    // =====================================================

    isActive: {
      type: Boolean,
      default: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    // =====================================================
    // NOTIFICATION TOKEN
    // =====================================================

    notificationToken: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// =========================================================
// HASH PASSWORD BEFORE SAVING
// =========================================================

customerSchema.pre("save", async function () {
  // Do not hash the password again when updating
  // another field on the customer account.
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// =========================================================
// COMPARE PASSWORD DURING LOGIN
// =========================================================

customerSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Customer", customerSchema);