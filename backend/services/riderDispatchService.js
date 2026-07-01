const Order = require("../models/Order");
const Rider = require("../models/Rider");
const sendSMS = require("../config/sms");

async function dispatchRiders(order) {
  try {
    const riders = await Rider.find({
      isApproved: true,
      isActive: true,
      isAvailable: true
    });

    if (!riders.length) return;

    order.riderAcceptanceStatus = "pending";
    order.riderDispatchStartedAt = new Date();
    await order.save();

    const message = `
🚨 NEW DELIVERY AVAILABLE (MIEZA)

Pickup: ${order.shopName || "Shop"}
Delivery Fee: GH₵${order.deliveryFee}

Accept now: Login to your rider dashboard
`;

    for (const rider of riders) {
      if (rider.phone) {
        await sendSMS(rider.phone, message);
      }
    }

    console.log(`Riders notified: ${riders.length}`);
  } catch (err) {
    console.log("Dispatch error:", err.message);
  }
}

module.exports = { dispatchRiders };