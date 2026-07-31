const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const rideDriverSchema = new mongoose.Schema({

    fullName:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },

    phone:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    profilePhoto:{
        type:String,
        default:""
    },

    currentLocation:{
        address:{
            type:String,
            default:""
        },

        latitude:Number,
        longitude:Number
    },

    vehicleType:{
        type:String,
        enum:[
            "motorbike",
            "taxi"
        ],
        required:true
    },

    vehicleBrand:{
        type:String,
        required:true
    },

    vehicleModel:{
        type:String,
        required:true
    },

    vehicleColor:{
        type:String,
        required:true
    },

    plateNumber:{
        type:String,
        required:true
    },

    vehiclePhotos:{
        type:[String],
        default:[]
    },

    driverLicenseNumber:{
        type:String,
        required:true
    },

    nationalIdNumber:{
        type:String,
        required:true
    },

    payoutMethod:{
        type:String,
        enum:["momo","bank"],
        default:"momo"
    },

    momoNumber:String,
    momoName:String,
    momoNetwork:String,
    momoBankCode:String,

    bankName:String,
    bankCode:String,
    accountName:String,
    accountNumber:String,

    paystackRecipientCode:{
        type:String,
        default:""
    },

    isApproved:{
        type:Boolean,
        default:false
    },

    isActive:{
    type:Boolean,
    default:false
},

    isOnline:{
        type:Boolean,
        default:false
    },

    isAvailable:{
        type:Boolean,
        default:false
    },

    averageRating:{
        type:Number,
        default:5
    },

    totalTrips:{
        type:Number,
        default:0
    },

    walletBalance:{
        type:Number,
        default:0
    },

    registrationFee:{
        type:Number,
        default:0
    },

    paystackReference:{
        type:String,
        default:""
    }

},{
    timestamps:true
});

rideDriverSchema.pre("save",async function(){

    if(!this.isModified("password")) return;

    this.password =
        await bcrypt.hash(this.password,10);

});

module.exports =
mongoose.model(
    "RideDriver",
    rideDriverSchema
);