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
        enum:["taxi","okada"],
        required:true
    },

    estimatedDistance:Number,

    estimatedDuration:Number,

    rideFare:Number,

    driverCommission:Number,

    driverEarnings:Number,

    status:{
        type:String,
        enum:[
            "searching",
            "accepted",
            "arrived",
            "ongoing",
            "completed",
            "cancelled"
        ],
        default:"searching"
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