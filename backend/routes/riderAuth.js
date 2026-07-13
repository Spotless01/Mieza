const express =
require("express");

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");

const Rider =
require("../models/Rider");

const Admin =
  require("../models/Admin");

  const Notification =
  require("../models/Notification");

const sendEmail =
  require("../config/brevo");

const router =
express.Router();

const Settings =
require("../models/Settings");


// ======================
// REGISTER RIDER
// ======================

router.post(
"/register",
async (req, res) => {

try {

const {

fullName,

phone,

email,

password,

vehicleType,

payoutMethod,

momoNumber,

momoName,

momoNetwork,

momoBankCode,

bankName,

bankCode,

accountName,

accountNumber,

paymentReference

} = req.body;

const normalizedEmail =
  String(email || "")
    .trim()
    .toLowerCase();

if (
  !fullName ||
  !phone ||
  !normalizedEmail ||
  !password ||
  !vehicleType
) {

  return res.status(400).json({
    message:
      "Please provide all required rider details"
  });

}

const existingRider =
  await Rider.findOne({
    email: normalizedEmail
  });

if (existingRider) {

return res.status(400)
.json({
message:
"Rider already exists"
});

}

const settings =
  await Settings.findOne();

const riderRegistrationFee =
  settings?.riderRegistrationFee ?? 100;

const riderPaymentRequired =
  settings?.riderRegistrationPaymentRequired ?? true;

if (
  riderPaymentRequired &&
  !paymentReference
) {

  return res.status(400).json({
    message:
      "Rider registration payment is required"
  });

}

const rider =
new Rider({

fullName,

phone,

email:
  normalizedEmail,

password,

vehicleType,

registrationFee:
  riderPaymentRequired
    ? riderRegistrationFee
    : 0,

paystackReference:
paymentReference || `FREE_RIDER_${Date.now()}_${Math.floor(Math.random() * 100000)}`,

isApproved:
false,

isActive:
true,

payoutMethod,

momoNumber,

momoName,

momoNetwork,

momoBankCode,

bankName,

bankCode,

accountName,

accountNumber

});

await rider.save();

console.log("✅ Rider saved");

// =====================================
// CREATE ADMIN DASHBOARD NOTIFICATION
// =====================================

try {

  await Notification.create({

    shopId: null,

    title:
      "New Rider Registration",

    message:
      `${rider.fullName} is awaiting approval`

  });

} catch (notificationError) {

  console.log(
    "Rider admin notification failed:",
    notificationError.message
  );

}

// =====================================
// EMAIL ACTIVE OWNERS AND CO-FOUNDERS
// =====================================

try {

  const admins =
    await Admin.find({

      isActive: true,

      role: {
        $in: [
          "owner",
          "cofounder"
        ]
      }

    }).select(
      "name email role"
    );

  const emailResults =
    await Promise.allSettled(

      admins.map(admin =>

        sendEmail(

          admin.email,

          "New Rider Waiting for Approval - Mieza",

          `
          <div style="
            max-width:600px;
            margin:0 auto;
            padding:24px;
            font-family:Arial,sans-serif;
            color:#1f2937;
          ">

            <h2 style="
              color:#0b5cff;
              margin-bottom:16px;
            ">
              New Rider Registration
            </h2>

            <p>
              Hello ${admin.name},
            </p>

            <p>
              A new rider has registered on Mieza and is waiting for approval.
            </p>

            <div style="
              margin:20px 0;
              padding:18px;
              border-radius:12px;
              background:#f3f6fb;
            ">

              <p>
                <strong>Rider:</strong>
                ${rider.fullName}
              </p>

              <p>
                <strong>Email:</strong>
                ${rider.email}
              </p>

              <p>
                <strong>Phone:</strong>
                ${rider.phone}
              </p>

              <p>
                <strong>Vehicle:</strong>
                ${rider.vehicleType}
              </p>

            </div>

            <p>
              Please log in to the Admin Dashboard to review and approve the rider.
            </p>

            <p style="margin:26px 0;">

              <a
                href="https://miezadelivery.com/admin-login.html"
                style="
                  display:inline-block;
                  padding:13px 20px;
                  background:#0b5cff;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:9px;
                  font-weight:700;
                "
              >
                Open Admin Dashboard
              </a>

            </p>

            <p style="
              font-size:13px;
              color:#6b7280;
            ">
              This alert was sent automatically by Mieza.
            </p>

          </div>
          `

        )

      )

    );

  emailResults.forEach(
    (result, index) => {

      const admin =
        admins[index];

      if (
        result.status ===
        "rejected"
      ) {

        console.log(
          `Rider alert email failed for ${admin.email}:`,
          result.reason?.message ||
          result.reason
        );

      } else {

        console.log(
          `Rider alert email sent to ${admin.email}`
        );

      }

    }
  );

} catch (emailError) {

  console.log(
    "Admin rider-email notification failed:",
    emailError.message
  );

}

res.status(201).json({

  message:
    "Rider registered successfully. Awaiting admin approval."

});

}

catch (err) {

console.log(err);

res.status(500).json({

message:
"Server error"

});

}

}
);




// ======================
// LOGIN RIDER
// ======================

router.post(
"/login",
async (req, res) => {

try {

const {

email,

password

} = req.body;

const rider =
await Rider.findOne({
  email:
    email.trim().toLowerCase()
});

console.log(
  "RIDER LOGIN CHECK:",
  rider?.email,
  "approved:",
  rider?.isApproved,
  "active:",
  rider?.isActive
);

if (!rider) {

return res.status(400)
.json({

message:
"Invalid credentials"

});

}

const match =
await bcrypt.compare(

password,

rider.password

);

if (!match) {

return res.status(400)
.json({

message:
"Invalid credentials"

});

}

if (!rider.isApproved) {

return res.status(403)
.json({

message:
"Your rider account is awaiting admin approval."

});

}

if (!rider.isActive) {

return res.status(403)
.json({

message:
"Your rider account has been suspended."

});

}

const token =
jwt.sign(

{
riderId:
rider._id
},

process.env.JWT_SECRET,

{
expiresIn: "7d"
}

);

const riderData = {

  _id: rider._id,

  fullName: rider.fullName,

  phone: rider.phone,

  email: rider.email,

  vehicleType: rider.vehicleType,

  isAvailable: rider.isAvailable,

  isApproved: rider.isApproved,

isActive: rider.isActive,

};

res.json({

  token,

  rider: riderData

});

}

catch (err) {

console.log(err);

res.status(500).json({

message:
"Server error"

});

}

}
);

module.exports =
router;