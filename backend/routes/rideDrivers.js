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
            name: "profilePhoto",
            maxCount: 1
        },
        {
            name: "vehiclePhotos",
            maxCount: 10
        }
    ]),
    rideDriverController.registerRideDriver
);

router.post(
    "/login",
    rideDriverController.loginRideDriver
);


router.get(
    "/me",
    rideDriverMiddleware,
    rideDriverController.getMyProfile
);

router.put(
    "/me",
    rideDriverMiddleware,
    rideDriverController.updateMyProfile
);

router.put(
    "/location",
    rideDriverMiddleware,
    rideDriverController.updateMyLocation
);


router.put(
    "/availability",
    rideDriverMiddleware,
    rideDriverController.toggleAvailability
);

// =====================================
// RIDE MATCHING
// =====================================

router.get(
    "/available-rides",
    rideDriverMiddleware,
    rideDriverController.getAvailableRides
);

router.get(
    "/active-ride/:rideId",
    rideDriverMiddleware,
    rideDriverController.getActiveRideStatus
);

// =====================================
// ADMIN ROUTES
// =====================================

router.get(
    "/admin/all",
    adminMiddleware,
    requireAdminRole("owner", "cofounder"),
    rideDriverController.getAllRideDrivers
);

router.get(
    "/admin/:id",
    adminMiddleware,
    requireAdminRole("owner", "cofounder"),
    rideDriverController.getRideDriverById
);

router.put(
    "/admin/:id/approve",
    adminMiddleware,
    requireAdminRole("owner", "cofounder"),
    rideDriverController.approveRideDriver
);

router.put(
    "/admin/:id/suspend",
    adminMiddleware,
    requireAdminRole("owner", "cofounder"),
    rideDriverController.suspendRideDriver
);

router.delete(
    "/admin/:id",
    adminMiddleware,
    requireAdminRole("owner"),
    rideDriverController.deleteRideDriver
);

module.exports = router;