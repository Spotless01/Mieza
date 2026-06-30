const axios = require("axios");

const Order =
  require("../models/Order");

const Shop =
  require("../models/Shop");

const Rider =
  require("../models/Rider");

const Settlement =
  require("../models/Settlement");

  const PayoutRun =
  require("../models/PayoutRun");

const Settings =
  require("../models/Settings");

async function sendPaystackTransfer({
  amount,
  recipient,
  reason,
  reference
}) {

  const res =
    await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: Math.round(amount * 100),
        recipient,
        reason,
        reference
      },
      {
        headers: {
          Authorization:
            `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

  return res.data;

}

async function runAutoPayouts() {

    const today =
    new Date().toISOString().split("T")[0];

  const existingRun =
    await PayoutRun.findOne({
      runDate: today,
      status: {
        $in: ["running", "completed"]
      }
    });

  if (existingRun) {
    console.log(
      `Auto payout already ran today: ${today}`
    );
    return;
  }

  const payoutRun =
    await PayoutRun.create({
      runDate: today,
      status: "running"
    });

  try {

    const settings =
      await Settings.findOne();

    if (!settings?.autoPayoutEnabled) {
      console.log("Auto payouts disabled");
      return;
    }

    const minimumAmount =
      settings.minimumSettlementAmount || 50;

    // Vendors
    const shops =
      await Shop.find({
        isApproved: true,
        isActive: true,
        autoPayoutEnabled: true,
        paystackRecipientCode: { $ne: "" }
      });

    for (const shop of shops) {

      const alreadyPaidVendorOrders =
  await Settlement.distinct("orders", {
    settlementType: "vendor",
    status: "completed"
  });

const orders =
  await Order.find({
    shopId: shop._id,
    status: "delivered",
    settlementStatus: "pending",
    _id: {
      $nin: alreadyPaidVendorOrders
    }
  });

      const amount =
        orders.reduce(
          (sum, order) =>
            sum + (order.vendorRevenue || 0),
          0
        );

      if (!orders.length || amount < minimumAmount) continue;

      const reference =
        `MIEZA_VENDOR_${shop._id}_${Date.now()}`;

      try {

        const transfer =
          await sendPaystackTransfer({
            amount,
            recipient: shop.paystackRecipientCode,
            reason: "Mieza vendor daily settlement",
            reference
          });

        await Settlement.create({
          settlementType: "vendor",
          shopId: shop._id,
          amountPaid: amount,
          payoutMethod: shop.payoutMethod,
          status: "completed",
          paystackTransferReference: reference,
          paystackTransferCode:
            transfer.data?.transfer_code || "",
          paystackStatus:
            transfer.data?.status || "",
          orders: orders.map(o => o._id)
        });

        await Order.updateMany(
          {
            _id: { $in: orders.map(o => o._id) }
          },
          {
            settlementStatus: "paid"
          }
        );

      } catch (err) {

        console.log(
          "Vendor payout failed:",
          shop.shopName,
          err.response?.data || err.message
        );

      }

    }

    // Riders
    const riders =
      await Rider.find({
        isApproved: true,
        isActive: true,
        autoPayoutEnabled: true,
        paystackRecipientCode: { $ne: "" }
      });

    for (const rider of riders) {

      const alreadyPaidRiderOrders =
  await Settlement.distinct("orders", {
    settlementType: "rider",
    status: "completed"
  });

const orders =
  await Order.find({
    riderId: rider._id,
    status: "delivered",
    riderSettlementStatus: "pending",
    _id: {
      $nin: alreadyPaidRiderOrders
    }
  });

      const amount =
        orders.reduce(
          (sum, order) =>
            sum + (order.riderEarnings || 0),
          0
        );

      if (!orders.length || amount < minimumAmount) continue;

      const reference =
        `MIEZA_RIDER_${rider._id}_${Date.now()}`;

      try {

        const transfer =
          await sendPaystackTransfer({
            amount,
            recipient: rider.paystackRecipientCode,
            reason: "Mieza rider daily settlement",
            reference
          });

        await Settlement.create({
          settlementType: "rider",
          riderId: rider._id,
          amountPaid: amount,
          payoutMethod: rider.payoutMethod,
          status: "completed",
          paystackTransferReference: reference,
          paystackTransferCode:
            transfer.data?.transfer_code || "",
          paystackStatus:
            transfer.data?.status || "",
          orders: orders.map(o => o._id)
        });

        await Order.updateMany(
          {
            _id: { $in: orders.map(o => o._id) }
          },
          {
            riderSettlementStatus: "paid"
          }
        );

      } catch (err) {

        console.log(
          "Rider payout failed:",
          rider.fullName,
          err.response?.data || err.message
        );

      }

    }

        payoutRun.status = "completed";

  payoutRun.notes =
    "Auto payouts completed successfully";

  await payoutRun.save();

} catch (err) {

  console.log(
    "AUTO PAYOUT ERROR:",
    err
  );

  payoutRun.status = "failed";

  payoutRun.notes =
    err.message;

  await payoutRun.save();

}


  
}

module.exports = {
  runAutoPayouts
};