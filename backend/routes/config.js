const express = require("express");

const router = express.Router();

router.get("/mapbox", (req, res) => {

  res.json({
    token: process.env.MAPBOX_TOKEN
  });

});

module.exports = router;