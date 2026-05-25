const express = require("express");
const router = express.Router();

const axios = require("axios");

// ======================================
// VERIFY PAYMENT
// ======================================

router.get("/verify/:reference", async (req, res) => {

  try {

    const reference =
      req.params.reference;

    const response =
      await axios.get(

        `https://api.paystack.co/transaction/verify/${reference}`,

        {
          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

    res.json(response.data);

  } catch (err) {

  console.log("========== PAYSTACK ERROR ==========");

  console.log(err.response?.data);

  console.log(err.message);

  console.log("===================================");

  res.status(500).json({
    error:
      err.response?.data ||
      err.message
  });
}
});

module.exports = router;