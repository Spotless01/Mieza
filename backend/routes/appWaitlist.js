const express = require("express");
const router = express.Router();

const AppWaitlist =
  require("../models/AppWaitlist");

router.post("/", async (req, res) => {
  try {
    const email =
      req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const existing =
      await AppWaitlist.findOne({ email });

    if (existing) {
      return res.json({
        message:
          "You're already on the Mieza app waitlist."
      });
    }

    await AppWaitlist.create({ email });

    res.json({
      message:
        "Thanks! We'll email you when the Mieza app launches."
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;