const express = require("express");
const router = express.Router();

const Shop = require("../models/Shop");
const Rider = require("../models/Rider");

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
      customerLongitude,
      weatherCondition
    } = req.body;

    const shop =
      await Shop.findById(shopId);

    if (!shop) {

      return res.status(404).json({
        message: "Shop not found"
      });

    }

    if (
      shop.latitude == null ||
      shop.longitude == null
    ) {

      return res.status(400).json({
        message: "Shop location not set"
      });

    }

    if (
      customerLatitude == null ||
      customerLongitude == null
    ) {

      return res.status(400).json({
        message: "Customer location required"
      });

    }

    const distanceKm =
      calculateDistance(

        shop.latitude,
        shop.longitude,

        customerLatitude,
        customerLongitude
      );

    // ===============================
    // BOLT-STYLE DYNAMIC PRICING
    // ===============================

    const BASE_FEE = 5;

    const PER_KM_RATE = 2;

    const distanceFee =
      distanceKm * PER_KM_RATE;

    const availableRiders =
      await Rider.countDocuments({
        isAvailable: true
      });

    let demandFee = 0;

    if (availableRiders === 0) {
      demandFee = 10;
    } else if (availableRiders <= 2) {
      demandFee = 5;
    }

    let weatherFee = 0;

    const condition =
      weatherCondition || "normal";

    if (condition === "rain") {
      weatherFee = 5;
    }

    if (condition === "heavy_rain") {
      weatherFee = 10;
    }

    const deliveryFee =
      Math.round(
        BASE_FEE +
        distanceFee +
        demandFee +
        weatherFee
      );

    const deliveryCommission =
      Number((deliveryFee * 0.10).toFixed(2));

    const riderEarnings =
      Number((deliveryFee - deliveryCommission).toFixed(2));

    res.json({

      distanceKm:
        Number(distanceKm.toFixed(2)),

      baseFee:
        BASE_FEE,

      perKmRate:
        PER_KM_RATE,

      distanceFee:
        Number(distanceFee.toFixed(2)),

      availableRiders,

      demandFee,

      weatherCondition:
        condition,

      weatherFee,

      deliveryFee,

      deliveryCommission,

      riderEarnings

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});

module.exports = router;