const axios = require("axios");

async function sendSMS(phone, message) {
  try {
    if (!phone || !message) return;

    const formattedPhone = phone.startsWith("+")
      ? phone
      : phone.startsWith("0")
      ? `+233${phone.slice(1)}`
      : `+${phone}`;

    console.log("Sending SMS to:", formattedPhone);

    const res = await axios.post(
      "https://sms.arkesel.com/api/v2/sms/send",
      {
        sender: "MIEZA",
        message,
        recipients: [formattedPhone]
      },
      {
        headers: {
          "api-key": process.env.ARKESEL_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("SMS SUCCESS:", res.data);
    return res.data;

  } catch (err) {
    console.log("SMS FAILED:");
    console.log(err.response?.data || err.message);
  }
}

module.exports = sendSMS;