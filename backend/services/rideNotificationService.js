const nodemailer = require("nodemailer");
const Admin = require("../models/Admin");
const RideDriver = require("../models/RideDriver");
const sendSMS = require("../config/sms");

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (!user || !pass) return null;
  transporter = host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || "false") === "true",
        auth: { user, pass }
      })
    : nodemailer.createTransport({ service: process.env.EMAIL_SERVICE || "gmail", auth: { user, pass } });
  return transporter;
}

async function sendEmail(to, subject, text) {
  const mailer = getTransporter();
  if (!mailer || !to) return { skipped: true };
  return mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to,
    subject,
    text
  });
}

function vehicleMatches(value) {
  const v = String(value || "").toLowerCase();
  return ["okada", "motorbike", "motorcycle", "bike"].includes(v) ? "okada" : "taxi";
}

function locationLabel(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.address || value.name || "Location unavailable";
  return "Location unavailable";
}

async function notifyRideRequest(ride) {
  const category = vehicleMatches(ride.vehicleType);
  const [drivers, admins] = await Promise.all([
    RideDriver.find({ isApproved: true, isActive: true }).select("fullName email phone vehicleType"),
    Admin.find({ isActive: true }).select("name email phone role")
  ]);
  const matchedDrivers = drivers.filter(driver => vehicleMatches(driver.vehicleType) === category);
  const label = category === "okada" ? "Okada" : "Taxi";
  const subject = `New Mieza ${label} ride request`;
  const details = [
    `A new ${label} ride request is available on Mieza.`,
    `Pickup: ${locationLabel(ride.pickupLocation)}`,
    `Destination: ${locationLabel(ride.destinationLocation)}`,
    `Estimated fare: GHS ${Number(ride.rideFare || 0).toFixed(2)}`,
    `Open your Mieza driver dashboard to review and accept the request.`
  ].join("\n");
  const tasks = [];
  for (const driver of matchedDrivers) {
    if (driver.phone) tasks.push(sendSMS(driver.phone, details));
    if (driver.email) tasks.push(sendEmail(driver.email, subject, details));
  }
  const adminDetails = [
    `A new ${label} ride request has been placed.`,
    `Pickup: ${locationLabel(ride.pickupLocation)}`,
    `Destination: ${locationLabel(ride.destinationLocation)}`,
    `Estimated fare: GHS ${Number(ride.rideFare || 0).toFixed(2)}`,
    `Ride ID: ${ride._id}`
  ].join("\n");
  for (const admin of admins) {
    if (admin.phone) tasks.push(sendSMS(admin.phone, adminDetails));
    if (admin.email) tasks.push(sendEmail(admin.email, subject, adminDetails));
  }
  const results = await Promise.allSettled(tasks);
  const failed = results.filter(result => result.status === "rejected");
  if (failed.length) console.warn(`Ride notification delivery: ${failed.length}/${results.length} failed or unavailable.`);
  if (!getTransporter()) console.warn("Ride notification email skipped: configure EMAIL_USER and EMAIL_PASS (or SMTP_HOST, SMTP_USER and SMTP_PASS).");
  return { notifiedDrivers: matchedDrivers.length, notifiedAdmins: admins.length, attempted: results.length, failed: failed.length };
}

module.exports = { notifyRideRequest };
