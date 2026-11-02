const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const { getPaystackCredentials } = require("../config/paystackCredentials");
const Settlement = require("../models/Settlement");
const Order = require("../models/Order");

// Verify a transaction against the Paystack environment selected in Admin Settings.
// Never trust a browser-side success message as proof of payment.
router.get("/verify/:reference", async (req, res) => {
  try {
    const reference = String(req.params.reference || "").trim();
    if (!reference || reference.length > 100) {
      return res.status(400).json({ status: false, message: "A valid payment reference is required." });
    }

    const credentials = await getPaystackCredentials();
    if (!credentials.configured) {
      return res.status(503).json({ status: false, message: `Paystack ${credentials.environment} mode is not configured.` });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${credentials.secretKey}` }, timeout: 15000 }
    );

    return res.status(200).json({
      status: response.data?.status === true,
      environment: credentials.environment,
      data: response.data?.data || null
    });
  } catch (err) {
    const status = err.response?.status || 500;
    console.error("Paystack verification failed:", err.response?.data?.message || err.message);
    return res.status(status).json({
      status: false,
      message: err.response?.data?.message || "Unable to verify payment at this time."
    });
  }
});

// Paystack signs webhook requests with the active API secret key.
// Express JSON middleware stores the original request bytes as req.rawBody.
router.post("/webhook", async (req, res) => {
  try {
    const credentials = await getPaystackCredentials();
    if (!credentials.configured) return res.sendStatus(503);

    const signature = req.get("x-paystack-signature") || "";
    const rawBody = req.rawBody;
    if (!signature || !rawBody) return res.sendStatus(400);

    const expected = crypto.createHmac("sha512", credentials.secretKey).update(rawBody).digest("hex");
    const suppliedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
      return res.sendStatus(401);
    }

    const event = req.body?.event;
    const transferReference = req.body?.data?.reference;
    if (typeof event !== "string") return res.sendStatus(400);

    // Transfer states are only finalised by a signed Paystack webhook, not by
    // the initial API response (which may only mean the transfer was queued).
    if (["transfer.success", "transfer.failed", "transfer.reversed"].includes(event) && transferReference) {
      const settlement = await Settlement.findOne({ paystackTransferReference: transferReference });
      if (settlement) {
        const nextStatus = event === "transfer.success" ? "completed" : "failed";
        settlement.status = nextStatus;
        settlement.paystackStatus = event;
        await settlement.save();
        if (nextStatus === "completed" && Array.isArray(settlement.orders) && settlement.orders.length) {
          const update = settlement.settlementType === "vendor"
            ? { settlementStatus: "paid" }
            : { riderSettlementStatus: "paid" };
          await Order.updateMany({ _id: { $in: settlement.orders } }, update);
        }
      }
    }

    console.info("Authenticated Paystack webhook received:", event);
    return res.sendStatus(200);
  } catch (err) {
    console.error("Paystack webhook error:", err.message);
    return res.sendStatus(500);
  }
});

module.exports = router;
