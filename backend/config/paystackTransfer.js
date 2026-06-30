const axios = require("axios");

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY;

// ==============================
// CREATE TRANSFER RECIPIENT
// ==============================
async function createTransferRecipient({
  name,
  accountNumber,
  bankCode,
  currency = "GHS"
}) {

  const res =
    await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban",
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency
      },
      {
        headers: {
          Authorization:
            `Bearer ${PAYSTACK_SECRET_KEY}`,

          "Content-Type":
            "application/json"
        }
      }
    );

  return res.data.data.recipient_code;
}

// ==============================
// INITIATE TRANSFER
// ==============================
async function initiateTransfer({
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
        amount:
          Math.round(amount * 100),
        recipient,
        reason,
        reference
      },
      {
        headers: {
          Authorization:
            `Bearer ${PAYSTACK_SECRET_KEY}`,

          "Content-Type":
            "application/json"
        }
      }
    );

  return res.data;
}

module.exports = {
  createTransferRecipient,
  initiateTransfer
};