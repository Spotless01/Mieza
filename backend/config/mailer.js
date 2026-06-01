const nodemailer = require("nodemailer");

console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS EXISTS:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log("BREVO ERROR:", error);
  } else {
    console.log("BREVO READY");
  }
});

module.exports = transporter;