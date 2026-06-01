const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;

transporter.verify(function (error, success) {
  if (error) {
    console.log("BREVO ERROR:", error);
  } else {
    console.log("BREVO READY");
  }
});