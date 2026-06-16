const express = require("express");

const router = express.Router();

router.get("/mapbox", (req, res) => {

  res.json({
    token: process.env.MAPBOX_TOKEN
  });

});

const Settings =
require("../models/Settings");

router.get("/settings", async (req, res) => {

  try {

    let settings =
      await Settings.findOne();

    if (!settings) {

      settings =
        await Settings.create({});

    }

    res.json(settings);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

module.exports = router;