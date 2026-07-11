const mongoose =
  require("mongoose");

const adminSchema =
  new mongoose.Schema(
    {
      name: {
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

      password: {
        type: String,
        required: true,
        select: false
      },

      role: {
        type: String,
        enum: [
          "owner",
          "cofounder"
        ],
        default: "cofounder"
      },

      isActive: {
        type: Boolean,
        default: true
      },

      mustChangePassword: {
  type: Boolean,
  default: false
},

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
      },

      lastLoginAt: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: true
    }
  );

module.exports =
  mongoose.model(
    "Admin",
    adminSchema
  );