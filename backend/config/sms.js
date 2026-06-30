const axios = require("axios");

async function sendSMS(phone, message) {
  try {
    if (!phone || !message) return;

    const formattedPhone = phone.startsWith("+")
      ? phone
      : phone.startsWith("0")
      ? `233${phone.slice(1)}`
      : phone;

    const res = await axios.post(
      "https://sms.arkesel.com/api/v2/sms/send",
      {
        sender: "MIEZA",
        message,
        recipients: [formattedPhone]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ARKESEL_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("SMS sent:", res.data);
    return res.data;

  } catch (err) {
    console.log("SMS FAILED:");
    console.log(err.response?.data || err.message);
  }
}

module.exports = sendSMS;