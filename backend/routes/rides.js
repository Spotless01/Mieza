const express = require("express");

const router = express.Router();

const customerMiddleware =
    require("../middleware/customerMiddleware");

const rideDriverMiddleware =
    require("../middleware/rideDriverMiddleware");

const rideController =
    require("../controllers/rideController");

router.post(
    "/request",
    customerMiddleware,
    rideController.requestRide
);


router.put(
    "/customer/:rideId/cancel",
    customerMiddleware,
    rideController.cancelCustomerRide
);


router.get(
    "/:rideId/status",
    customerMiddleware,
    rideController.getCustomerRideStatus
);


router.put(
    "/:rideId/accept",
    rideDriverMiddleware,
    rideController.acceptRide
);

router.put(
    "/:rideId/arrive",
    rideDriverMiddleware,
    rideController.markDriverArrived
);

router.put(
    "/:rideId/start",
    rideDriverMiddleware,
    rideController.startRide
);

router.put(
    "/:rideId/complete",
    rideDriverMiddleware,
    rideController.completeRide
);

router.put(
    "/:rideId/cancel",
    rideDriverMiddleware,
    rideController.cancelRide
);
module.exports = router;