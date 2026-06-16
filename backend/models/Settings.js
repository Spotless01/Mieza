const mongoose = require("mongoose");

const settingsSchema =
new mongoose.Schema({

  vendorCommissionRate: {
    type: Number,
    default: 10
  },

  riderCommissionRate: {
    type: Number,
    default: 10
  },

  supportEmail: {
    type: String,
    default: "miezadelivery@gmail.com"
  },

  supportPhone1: {
    type: String,
    default: "+233 55 183 6194"
  },

  supportPhone2: {
    type: String,
    default: "+233 20 289 8583"
  },

  supportPhone3: {
  type: String,
  default: ""
},

supportPhone4: {
  type: String,
  default: ""
},

  businessLocation: {
    type: String,
    default: "Accra, Ghana"
  },

  workingHours: {
    type: String,
    default: "Monday – Sunday, 24hrs"
  }

},
{
  timestamps: true
});

module.exports =
mongoose.model(
  "Settings",
  settingsSchema
);