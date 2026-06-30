require("dotenv").config();

const mongoose = require("mongoose");
const axios = require("axios");

const Shop = require("../models/Shop");
const Rider = require("../models/Rider");

async function getBankCode(network) {
  const res = await axios.get(
    "https://api.paystack.co/bank?currency=GHS",
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    }
  );

  const banks = res.data.data;

  const match = banks.find(b =>
    b.name.toLowerCase().includes(network.toLowerCase())
  );

  return match ? match.code : null;
}

async function createPaystackRecipient(user) {
  if (user.paystackRecipientCode) {
    return user.paystackRecipientCode;
  }

  const isMomo = true; // FORCE MOMO ONLY for now

const normalizedNetwork = (user.momoNetwork || "")
  .toUpperCase()
  .replace(/\s/g, "");

const bank_code = await getBankCode(user.momoNetwork);

if (!bank_code) {
  console.log(
    `⚠️ Skipping ${user.shopName || user.fullName} - invalid network: ${user.momoNetwork}`
  );
  return null;
}

const payload = {
  type: "mobile_money",
  name: user.momoName || user.fullName || user.ownerName,
  account_number: user.momoNumber,
  bank_code: bank_code,
  currency: "GHS"
};

  const res = await axios.post(
    "https://api.paystack.co/transferrecipient",
    payload,
    {
      headers: {
        Authorization:
          `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  user.paystackRecipientCode =
    res.data.data.recipient_code;

  await user.save();

  return user.paystackRecipientCode;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const shops = await Shop.find({
  isApproved: true,
  payoutMethod: "momo",
  paystackRecipientCode: {
    $in: ["", null]
  }
});

const riders = await Rider.find({
  isApproved: true,
  payoutMethod: "momo",
  paystackRecipientCode: {
    $in: ["", null]
  }
});

    console.log(`Shops to update: ${shops.length}`);
    console.log(`Riders to update: ${riders.length}`);

    for (const shop of shops) {
  try {
    if (!shop.momoNetwork || !shop.momoNumber) {
      console.log(`⚠️ Skipping ${shop.shopName} - missing MoMo details`);
      continue;
    }

    await createPaystackRecipient(shop);
    console.log(`✅ Shop updated: ${shop.shopName}`);

  } catch (err) {
    console.log(
      `❌ Shop failed: ${shop.shopName}`,
      err.response?.data || err.message
    );
  }
}

  for (const rider of riders) {
  try {

    if (!rider.momoNetwork || !rider.momoNumber) {
      console.log(`⚠️ Skipping ${rider.fullName} - missing MoMo details`);
      continue;
    }

    await createPaystackRecipient(rider);
    console.log(`✅ Rider updated: ${rider.fullName}`);

  } catch (err) {
    console.log(
      `❌ Rider failed: ${rider.fullName}`,
      err.response?.data || err.message
    );
  }
}

    console.log("Recipient migration completed");
    process.exit(0);

  } catch (err) {
    console.log("Migration failed:", err.message);
    process.exit(1);
  }
}

run();