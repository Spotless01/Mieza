const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({

    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Customer",
        required:true
    },

    driverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"RideDriver",
        default:null
    },

    pickupLocation:{
        address:String,
        latitude:Number,
        longitude:Number
    },

    destinationLocation:{
        address:String,
        latitude:Number,
        longitude:Number
    },

    vehicleType:{
        type:String,
        enum: ["taxi", "motorbike", "okada"],
        required:true
    },

    estimatedDistance:Number,

    estimatedDuration:Number,

    rideFare:Number,

    driverCommission:Number,

    driverEarnings:Number,

    // Persist each driver who was shown this ride, once, so acceptance rate
    // can be calculated from real offers rather than guessed from completed trips.
    offeredTo: [{
        driverId: { type: mongoose.Schema.Types.ObjectId, ref: "RideDriver", required: true },
        offeredAt: { type: Date, default: Date.now },
        acceptedAt: { type: Date, default: null }
    }],

status: {
    type: String,
    enum: [
        "searching",
        "accepted",
        "arrived",
        "ongoing",
        "completed",
        "cancelled",
        "expired"
    ],
    default: "searching"
},

    paymentMethod:{
        type:String,
        default:"cash"
    },

    paid:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
});

module.exports =
mongoose.model(
    "Ride",
    rideSchema
);