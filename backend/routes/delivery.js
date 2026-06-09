const express = require("express");
const router = express.Router();

const Shop = require("../models/Shop");

const calculateDistance =
require("../utils/distance");

// ====================================
// CALCULATE DELIVERY
// ====================================

router.post("/calculate", async (req, res) => {

  try {

    const {
      shopId,
      customerLatitude,
      customerLongitude
    } = req.body;

    const shop =
      await Shop.findById(shopId);

    if (!shop) {

      return res.status(404).json({
        message: "Shop not found"
      });

    }

    const distanceKm =
      calculateDistance(

        shop.latitude,
        shop.longitude,

        customerLatitude,
        customerLongitude
      );

    const BASE_FEE = 5;

    const PER_KM_RATE = 1.5;

    const deliveryFee =
      Math.round(
        BASE_FEE +
        (distanceKm * PER_KM_RATE)
      );

    res.json({

      distanceKm:
        Number(distanceKm.toFixed(2)),

      deliveryFee

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});

module.exports = router;