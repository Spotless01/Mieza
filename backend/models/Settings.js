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

termsAndConditions: {
  type: String,
  default: `By registering on Mieza, you agree to follow Mieza's marketplace rules, provide accurate information, deliver good service, and accept that Mieza may suspend accounts that violate platform policies.`
},

  businessLocation: {
    type: String,
    default: "Accra, Ghana"
  },

  workingHours: {
    type: String,
    default: "Monday – Sunday, 24hrs"
  },

  shopRegistrationFee: {
  type: Number,
  default: 200
},

riderRegistrationFee: {
  type: Number,
  default: 100
},

shopRegistrationPaymentRequired: {
  type: Boolean,
  default: true
},

riderRegistrationPaymentRequired: {
  type: Boolean,
  default: true
},

autoPayoutEnabled: {
  type: Boolean,
  default: true
},

settlementFrequency: {
  type: String,
  enum: ["daily", "weekly", "monthly"],
  default: "daily"
},

settlementHour: {
  type: Number,
  default: 22
},

minimumSettlementAmount: {
  type: Number,
  default: 50
},

retryFailedSettlements: {
  type: Boolean,
  default: true
},

},
{
  timestamps: true
});

module.exports =
mongoose.model(
  "Settings",
  settingsSchema
);