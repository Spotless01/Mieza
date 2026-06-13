const bcrypt =
require("bcryptjs");

const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  vehicleType: {
    type: String,
    enum: [
      "motorbike",
      "car",
      "bicycle"
    ],
    default: "motorbike"
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  currentLatitude: {
    type: Number,
    default: null
  },

  currentLongitude: {
    type: Number,
    default: null
  }

},
{
  timestamps: true
});

riderSchema.pre(
"save",
async function () {

if (
!this.isModified(
"password"
)
)
return;

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

