const express = require("express");
const router = express.Router();

const upload =
require("../middleware/upload");

const rideDriverMiddleware =
require("../middleware/rideDriverMiddleware");

const rideDriverController =
require("../controllers/rideDriverController");

router.post(

"/register",

upload.fields([

{
name:"profilePhoto",
maxCount:1
},

{
name:"vehiclePhotos",
maxCount:10
}

]),

rideDriverController.registerRideDriver

);

router.post(
    "/login",
    rideDriverController.loginRideDriver
);

router.put(
"/availability",
rideDriverMiddleware,
rideDriverController.toggleAvailability
);

module.exports = router;