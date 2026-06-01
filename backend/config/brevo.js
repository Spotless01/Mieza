const axios = require("axios");

async function sendEmail(to, subject, htmlContent) {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Mieza",
          email: "miezadelivery@gmail.com"
        },
        to: [
          {
            email: to
          }
        ],
        subject,
        htmlContent
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Email sent to:", to);

  } catch (error) {

    console.log(
      "BREVO API ERROR:",
      error.response?.data || error.message
    );
  }
}

module.exports = sendEmail;