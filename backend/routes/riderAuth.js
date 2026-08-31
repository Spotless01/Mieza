const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const Rider = require("../models/Rider");

const Admin = require("../models/Admin");

const Notification =
  require("../models/Notification");

const Settings =
  require("../models/Settings");

const sendEmail =
  require("../config/brevo");

const sendSMS =
  require("../config/sms");

const cloudinary =
  require("../config/cloudinary");

const riderUpload =
  require("../middleware/riderUpload");


const router =
  express.Router();


// =====================================================
// CLOUDINARY BUFFER UPLOAD HELPER
// =====================================================

const uploadToCloudinary = (
  buffer,
  folder
) => {

  return new Promise(
    (resolve, reject) => {

      const stream =
        cloudinary.uploader.upload_stream(
          {
            folder,

            resource_type:
              "image"
          },

          (error, result) => {

            if (error) {
              return reject(error);
            }

            resolve(result);
          }
        );

      stream.end(buffer);
    }
  );
};


// =====================================================
// DELETE CLOUDINARY IMAGE
// =====================================================

const deleteCloudinaryImage = async (
  publicId
) => {

  try {

    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image"
      }
    );

  } catch (error) {

    console.log(
      "Cloudinary cleanup error:",
      error.message
    );

  }
};


// =====================================================
// REGISTER RIDER
// =====================================================

router.post(
  "/register",

  riderUpload.fields([
    {
      name: "profilePhoto",
      maxCount: 1
    },

    {
      name: "vehiclePhotos",
      maxCount: 5
    }
  ]),

  async (req, res) => {

    let uploadedImages = [];

    try {

      // =================================================
      // READ FORM DATA
      // =================================================

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

        currentLocation,

        currentLatitude,

        currentLongitude,

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


      // =================================================
      // NORMALIZE VALUES
      // =================================================

      const normalizedEmail =
        String(email || "")
          .trim()
          .toLowerCase();

      const normalizedPhone =
        String(phone || "")
          .trim();

      const normalizedNationalId =
        String(
          nationalIdNumber || ""
        )
          .trim()
          .toUpperCase();


      // =================================================
      // BASIC VALIDATION
      // =================================================

      if (
        !fullName ||
        !normalizedPhone ||
        !normalizedEmail ||
        !password ||
        !vehicleType
      ) {

        return res.status(400).json({

          message:
            "Please complete all required fields."

        });

      }


      // =================================================
      // GHANA CARD VALIDATION
      // =================================================

      if (!normalizedNationalId) {

        return res.status(400).json({

          message:
            "Ghana Card number is required."

        });

      }


      // =================================================
      // PROFILE PHOTO
      // =================================================

      const profileFiles =
        req.files?.profilePhoto || [];

      if (
        profileFiles.length === 0
      ) {

        return res.status(400).json({

          message:
            "Profile picture is required."

        });

      }


      // =================================================
      // VEHICLE PHOTO VALIDATION
      // =================================================

      const vehicleFiles =
        req.files?.vehiclePhotos || [];


      if (
        vehicleType !== "bicycle" &&
        vehicleFiles.length === 0
      ) {

        return res.status(400).json({

          message:
            "At least one vehicle picture is required."

        });

      }


      // =================================================
      // VEHICLE INFORMATION
      // =================================================

      if (
        vehicleType !== "bicycle"
      ) {

        if (

          !driverLicenseNumber ||

          !vehicleBrand ||

          !vehicleModel ||

          !plateNumber

        ) {

          return res.status(400).json({

            message:
              "Please complete all vehicle information."

          });

        }

      }


      // =================================================
      // CHECK EXISTING EMAIL
      // =================================================

      const existingRider =
        await Rider.findOne({

          email:
            normalizedEmail

        });


      if (existingRider) {

        return res.status(400).json({

          message:
            "Rider already exists."

        });

      }


      // =================================================
      // CHECK EXISTING PHONE
      // =================================================

      const existingPhone =
        await Rider.findOne({

          phone:
            normalizedPhone

        });


      if (existingPhone) {

        return res.status(400).json({

          message:
            "Phone number already registered."

        });

      }


      // =================================================
      // CHECK EXISTING GHANA CARD
      // =================================================

      const existingNationalId =
        await Rider.findOne({

          nationalIdNumber:
            normalizedNationalId

        });


      if (existingNationalId) {

        return res.status(400).json({

          message:
            "This Ghana Card number is already registered."

        });

      }


      // =================================================
      // SETTINGS
      // =================================================

      const settings =
        await Settings.findOne();


      const riderRegistrationFee =
        settings?.riderRegistrationFee ??
        100;


      const riderPaymentRequired =
        settings?.riderRegistrationPaymentRequired ??
        true;


      // =================================================
      // PAYMENT VALIDATION
      // =================================================

      if (
        riderPaymentRequired &&
        !paymentReference
      ) {

        return res.status(400).json({

          message:
            "Rider registration payment is required."

        });

      }


      // =================================================
      // UPLOAD PROFILE PHOTO
      // =================================================

      const profileUpload =
        await uploadToCloudinary(

          profileFiles[0].buffer,

          "mieza/riders/profile"

        );


      uploadedImages.push(
        profileUpload.public_id
      );


      const profilePhoto =
        profileUpload.secure_url;


      // =================================================
      // UPLOAD VEHICLE PHOTOS
      // =================================================

      const vehiclePhotos = [];


      for (
        const file of vehicleFiles
      ) {

        const upload =
          await uploadToCloudinary(

            file.buffer,

            "mieza/riders/vehicles"

          );


        uploadedImages.push(
          upload.public_id
        );


        vehiclePhotos.push(
          upload.secure_url
        );

      }


      // =================================================
      // CREATE RIDER
      // =================================================

      const rider =
        new Rider({

          fullName:
            String(fullName).trim(),

          phone:
            normalizedPhone,

          email:
            normalizedEmail,

          password,

          // ---------------------------------------------
          // PROFILE
          // ---------------------------------------------

          profilePhoto,

          nationalIdNumber:
            normalizedNationalId,

          // ---------------------------------------------
          // VEHICLE
          // ---------------------------------------------

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

          vehiclePhotos,

          // ---------------------------------------------
          // LOCATION
          // ---------------------------------------------

          currentLocation:
            String(
              currentLocation || ""
            ).trim(),

          currentLatitude:
            currentLatitude
              ? Number(currentLatitude)
              : null,

          currentLongitude:
            currentLongitude
              ? Number(currentLongitude)
              : null,

          // ---------------------------------------------
          // REGISTRATION
          // ---------------------------------------------

          registrationFee:
            riderPaymentRequired
              ? riderRegistrationFee
              : 0,

          paystackReference:
            paymentReference ||
            `FREE_RIDER_${Date.now()}_${Math.floor(
              Math.random() * 100000
            )}`,

          // ---------------------------------------------
          // STATUS
          // ---------------------------------------------

          isApproved:
            false,

          isActive:
            true,

          isAvailable:
            true,

          // ---------------------------------------------
          // PAYOUT
          // ---------------------------------------------

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


      // =================================================
      // SAVE RIDER
      // =================================================

      await rider.save();


      console.log(
        "✅ Rider saved:",
        rider._id
      );


      // =================================================
      // CREATE ADMIN DASHBOARD NOTIFICATION
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
      // EMAIL ACTIVE OWNERS / CO-FOUNDERS
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

            admins.map(admin => {

              console.log(
                "Sending rider email to:",
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
                    A new rider has registered on Mieza
                    and is waiting for approval.
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
                    Please log in to the Admin Dashboard
                    to review the rider's profile,
                    documents and vehicle pictures.
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

            })

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
      // SMS ACTIVE OWNERS / CO-FOUNDERS
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

      return res.status(201).json({

        message:
          "Rider registered successfully. Awaiting admin approval.",

        rider: {

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


      // =================================================
      // CLOUDINARY CLEANUP
      // =================================================

      if (
        uploadedImages.length > 0
      ) {

        for (
          const publicId
          of uploadedImages
        ) {

          await deleteCloudinaryImage(
            publicId
          );

        }

      }


      // =================================================
      // MULTER ERRORS
      // =================================================

      if (
        err.code === "LIMIT_FILE_SIZE"
      ) {

        return res.status(400).json({

          message:
            "One of the images is larger than the 5 MB limit."

        });

      }


      if (
        err.code === "LIMIT_FILE_COUNT"
      ) {

        return res.status(400).json({

          message:
            "Too many images were uploaded."

        });

      }


      if (
        err.message?.includes(
          "Only JPG"
        )
      ) {

        return res.status(400).json({

          message:
            err.message

        });

      }


      return res.status(500).json({

        message:
          err.message ||
          "Unable to register rider."

      });

    }

  }
);


// =====================================================
// LOGIN RIDER
// =====================================================

router.post(
  "/login",

  async (req, res) => {

    try {

      const {

        email,

        password

      } = req.body;


      const normalizedEmail =
        String(email || "")
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


      if (
        !rider.isApproved
      ) {

        return res.status(403).json({

          message:
            "Your rider account is awaiting admin approval."

        });

      }


      if (
        !rider.isActive
      ) {

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

        isAvailable:
          rider.isAvailable,

        isApproved:
          rider.isApproved,

        isActive:
          rider.isActive,

        profilePhoto:
          rider.profilePhoto,

        vehiclePhotos:
          rider.vehiclePhotos

      };


      return res.json({

        token,

        rider:
          riderData

      });

    } catch (err) {

      console.log(
        "RIDER LOGIN ERROR:",
        err
      );


      return res.status(500).json({

        message:
          "Server error"

      });

    }

  }
);


module.exports =
  router;