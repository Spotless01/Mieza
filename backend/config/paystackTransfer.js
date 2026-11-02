const axios = require("axios");

const { getPaystackCredentials } = require("./paystackCredentials");

async function authorizationHeaders() {
  const credentials = await getPaystackCredentials();
  if (!credentials.configured) {
    throw new Error(`Paystack ${credentials.environment} secret key is not configured.`);
  }
  return { Authorization: `Bearer ${credentials.secretKey}`, "Content-Type": "application/json" };
}

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
        headers: await authorizationHeaders()
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
        headers: await authorizationHeaders()
      }
    );

  return res.data;
}

module.exports = {
  createTransferRecipient,
  initiateTransfer
};