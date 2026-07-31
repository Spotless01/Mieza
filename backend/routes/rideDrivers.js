const express = require("express");
const router = express.Router();

const upload =
require("../middleware/upload");

const rideDriverMiddleware =
require("../middleware/rideDriverMiddleware");

const adminMiddleware =
require("../middleware/adminMiddleware");

const requireAdminRole =
require("../middleware/requireAdminRole");

const rideDriverController =
require("../controllers/rideDriverController");

// =====================================
// DRIVER ROUTES
// =====================================

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

// =====================================
// ADMIN ROUTES
// =====================================

// Get all ride drivers

router.get(

"/admin/all",

adminMiddleware,

requireAdminRole(
"owner",
"cofounder"
),

rideDriverController.getAllRideDrivers

);

// Get one ride driver

router.get(

"/admin/:id",

adminMiddleware,

requireAdminRole(
"owner",
"cofounder"
),

rideDriverController.getRideDriverById

);

// Approve ride driver

router.put(

"/admin/:id/approve",

adminMiddleware,

requireAdminRole(
"owner",
"cofounder"
),

rideDriverController.approveRideDriver

);

// Suspend ride driver

router.put(

"/admin/:id/suspend",

adminMiddleware,

requireAdminRole(
"owner",
"cofounder"
),

rideDriverController.suspendRideDriver

);

// Delete ride driver

router.delete(

"/admin/:id",

adminMiddleware,

requireAdminRole(
"owner"
),

rideDriverController.deleteRideDriver

);

module.exports = router;