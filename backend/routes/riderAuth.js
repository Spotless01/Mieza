const express = require("express");

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

const sendSMS =
  require("../config/sms");

const Settings =
  require("../models/Settings");

const router =
  express.Router();


// ==================================================
// REGISTER RIDER
// ==================================================

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

        driverLicenseNumber,
        vehicleBrand,
        vehicleModel,
        vehicleColor,
        plateNumber,

        profilePhoto,

        currentLocation,
        currentLatitude,
        currentLongitude,

        vehiclePhotos,

        nationalIdNumber,

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


      // ==========================================
      // NORMALIZE DATA
      // ==========================================

      const normalizedEmail =
        String(email || "")
          .trim()
          .toLowerCase();

      const normalizedPhone =
        String(phone || "")
          .trim();


      // ==========================================
      // BASIC REQUIRED FIELDS
      // ==========================================

      if (
        !fullName ||
        !normalizedPhone ||
        !normalizedEmail ||
        !password ||
        !vehicleType ||
        !nationalIdNumber
      ) {

        return res.status(400).json({

          message:
            "Please complete all required fields."

        });

      }


      // ==========================================
      // VEHICLE VALIDATION
      // ==========================================

      if (
        ![
          "motorbike",
          "car",
          "bicycle"
        ].includes(vehicleType)
      ) {

        return res.status(400).json({

          message:
            "Invalid vehicle type."

        });

      }


      // ==========================================
      // VEHICLE DETAILS
      // REQUIRED FOR MOTORBIKE AND CAR
      // ==========================================

      if (
        vehicleType !== "bicycle"
      ) {

        if (

          !String(
            driverLicenseNumber || ""
          ).trim() ||

          !String(
            vehicleBrand || ""
          ).trim() ||

          !String(
            vehicleModel || ""
          ).trim() ||

          !String(
            plateNumber || ""
          ).trim()

        ) {

          return res.status(400).json({

            message:
              "Please complete all vehicle information."

          });

        }

      }


      // ==========================================
      // CHECK EMAIL
      // ==========================================

      const existingRider =
        await Rider.findOne({
          email: normalizedEmail
        });

      if (existingRider) {

        return res.status(400).json({

          message:
            "Rider already exists."

        });

      }


      // ==========================================
      // CHECK PHONE
      // ==========================================

      const existingPhone =
        await Rider.findOne({
          phone: normalizedPhone
        });

      if (existingPhone) {

        return res.status(400).json({

          message:
            "Phone number already registered."

        });

      }


      // ==========================================
      // SETTINGS
      // ==========================================

      let settings =
        await Settings.findOne();

      if (!settings) {

        settings =
          await Settings.create({});

      }


      const riderRegistrationFee =
        settings.riderRegistrationFee ??
        100;


      const riderPaymentRequired =
        settings.riderRegistrationPaymentRequired ??
        true;


      // ==========================================
      // PAYMENT VALIDATION
      // ==========================================

      if (
        riderPaymentRequired &&
        !paymentReference
      ) {

        return res.status(400).json({

          message:
            "Rider registration payment is required."

        });

      }


      // ==========================================
      // PAYSTACK REFERENCE
      // ==========================================

      const finalPaymentReference =
        String(
          paymentReference || ""
        ).trim() ||

        `FREE_RIDER_${Date.now()}_${Math.floor(
          Math.random() * 100000
        )}`;


      // ==========================================
      // CREATE RIDER
      // ==========================================

      const rider =
        new Rider({

          fullName:
            String(fullName).trim(),

          phone:
            normalizedPhone,

          email:
            normalizedEmail,

          password,

          vehicleType,

          driverLicenseNumber:
            String(
              driverLicenseNumber || ""
            ).trim(),

          vehicleBrand:
            String(
              vehicleBrand || ""
            ).trim(),

          vehicleModel:
            String(
              vehicleModel || ""
            ).trim(),

          vehicleColor:
            String(
              vehicleColor || ""
            ).trim(),

          plateNumber:
            String(
              plateNumber || ""
            ).trim(),

          // ======================================
          // CLOUDINARY PROFILE PHOTO
          // ======================================

          profilePhoto:
            String(
              profilePhoto || ""
            ).trim(),

          // ======================================
          // LOCATION
          // ======================================

          currentLocation:
            String(
              currentLocation || ""
            ).trim(),

          currentLatitude:
            currentLatitude !== undefined &&
            currentLatitude !== null &&
            currentLatitude !== ""
              ? Number(currentLatitude)
              : null,

          currentLongitude:
            currentLongitude !== undefined &&
            currentLongitude !== null &&
            currentLongitude !== ""
              ? Number(currentLongitude)
              : null,

          // ======================================
          // GHANA CARD
          // ======================================

          nationalIdNumber:
            String(
              nationalIdNumber || ""
            ).trim(),

          // ======================================
          // VEHICLE PHOTOS
          // ======================================

          vehiclePhotos:
            Array.isArray(vehiclePhotos)
              ? vehiclePhotos
                  .filter(
                    photo =>
                      typeof photo ===
                      "string" &&
                      photo.trim()
                  )
                  .map(
                    photo =>
                      photo.trim()
                  )
              : [],

          // ======================================
          // REGISTRATION FEE
          // ======================================

          registrationFee:
            riderPaymentRequired
              ? riderRegistrationFee
              : 0,

          paystackReference:
            finalPaymentReference,

          // ======================================
          // STATUS
          // ======================================

          isApproved:
            false,

          isActive:
            true,

          // ======================================
          // PAYOUT
          // ======================================

          payoutMethod:
            payoutMethod === "bank"
              ? "bank"
              : "momo",

          momoNumber:
            String(
              momoNumber || ""
            ).trim(),

          momoName:
            String(
              momoName || ""
            ).trim(),

          momoNetwork:
            String(
              momoNetwork || ""
            ).trim(),

          momoBankCode:
            String(
              momoBankCode || ""
            ).trim(),

          bankName:
            String(
              bankName || ""
            ).trim(),

          bankCode:
            String(
              bankCode || ""
            ).trim(),

          accountName:
            String(
              accountName || ""
            ).trim(),

          accountNumber:
            String(
              accountNumber || ""
            ).trim()

        });


      await rider.save();


      console.log(
        "✅ Rider saved:",
        rider._id
      );


      // =================================================
      // ADMIN DASHBOARD NOTIFICATION
      // =================================================

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


      // =================================================
      // EMAIL ACTIVE OWNERS AND CO-FOUNDERS
      // =================================================

      try {

        console.log(
          "Entering rider admin email section..."
        );


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


        console.log(
          "Admins found:",
          admins.length
        );


        const emailResults =
          await Promise.allSettled(

            admins.map(
              admin => {

                console.log(
                  "Sending rider registration email to:",
                  admin.email
                );


                return sendEmail(

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

                      <p>
                        <strong>Ghana Card:</strong>
                        ${rider.nationalIdNumber}
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

                );

              }
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


      // =================================================
      // SMS ACTIVE OWNERS AND CO-FOUNDERS
      // =================================================

      try {

        const adminsWithPhone =
          await Admin.find({

            isActive: true,

            role: {
              $in: [
                "owner",
                "cofounder"
              ]
            },

            phone: {
              $exists: true,
              $ne: ""
            }

          }).select(
            "name phone role"
          );


        const smsResults =
          await Promise.allSettled(

            adminsWithPhone.map(
              admin => {

                console.log(

                  "Sending rider registration SMS to:",
                  admin.phone

                );


                return sendSMS(

                  admin.phone,

`MIEZA ADMIN

New rider awaiting approval.

Rider:
${rider.fullName}

Vehicle:
${rider.vehicleType}

Phone:
${rider.phone}

Ghana Card:
${rider.nationalIdNumber}

Log in to the Admin Dashboard to review the registration.

miezadelivery.com/admin-login.html`

                );

              }
            )

          );


        smsResults.forEach(
          (result, index) => {

            const admin =
              adminsWithPhone[index];


            if (
              result.status ===
              "rejected"
            ) {

              console.log(

                `Rider alert SMS failed for ${admin.phone}:`,

                result.reason?.message ||
                result.reason

              );

            } else {

              console.log(

                `Rider alert SMS sent to ${admin.phone}`

              );

            }

          }
        );


      } catch (smsError) {

        console.log(

          "Admin rider SMS notification failed:",

          smsError.message

        );

      }


      // =================================================
      // SUCCESS
      // =================================================

      res.status(201).json({

        message:
          "Rider registered successfully. Awaiting admin approval.",

        rider: {

          _id:
            rider._id,

          fullName:
            rider.fullName,

          email:
            rider.email,

          phone:
            rider.phone,

          vehicleType:
            rider.vehicleType,

          profilePhoto:
            rider.profilePhoto,

          vehiclePhotos:
            rider.vehiclePhotos,

          nationalIdNumber:
            rider.nationalIdNumber,

          isApproved:
            rider.isApproved,

          isActive:
            rider.isActive

        }

      });


    } catch (err) {

      console.error(
        "RIDER REGISTRATION ERROR:"
      );

      console.error(err);


      res.status(500).json({

        message:
          err.message ||
          "Unable to register rider."

      });

    }

  }
);


// ==================================================
// LOGIN RIDER
// ==================================================

router.post(
  "/login",

  async (req, res) => {

    try {

      const {

        email,

        password

      } = req.body;


      const normalizedEmail =
        String(
          email || ""
        )
          .trim()
          .toLowerCase();


      if (
        !normalizedEmail ||
        !password
      ) {

        return res.status(400).json({

          message:
            "Email and password are required."

        });

      }


      const rider =
        await Rider.findOne({

          email:
            normalizedEmail

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

        return res.status(400).json({

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

        return res.status(400).json({

          message:
            "Invalid credentials"

        });

      }


      if (!rider.isApproved) {

        return res.status(403).json({

          message:
            "Your rider account is awaiting admin approval."

        });

      }


      if (!rider.isActive) {

        return res.status(403).json({

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
            expiresIn:
              "7d"
          }

        );


      const riderData = {

        _id:
          rider._id,

        fullName:
          rider.fullName,

        phone:
          rider.phone,

        email:
          rider.email,

        vehicleType:
          rider.vehicleType,

        profilePhoto:
          rider.profilePhoto,

        vehiclePhotos:
          rider.vehiclePhotos,

        nationalIdNumber:
          rider.nationalIdNumber,

        currentLocation:
          rider.currentLocation,

        currentLatitude:
          rider.currentLatitude,

        currentLongitude:
          rider.currentLongitude,

        isAvailable:
          rider.isAvailable,

        isApproved:
          rider.isApproved,

        isActive:
          rider.isActive

      };


      res.json({

        token,

        rider:
          riderData

      });


    } catch (err) {

      console.log(
        err
      );


      res.status(500).json({

        message:
          "Server error"

      });

    }

  }
);


module.exports =
  router;