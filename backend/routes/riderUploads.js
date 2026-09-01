const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// ============================================
// MULTER MEMORY STORAGE
// ============================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 6
  },

  fileFilter: (req, file, cb) => {

    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new Error("Only image files are allowed.")
      );
    }

    cb(null, true);
  }
});

// ============================================
// CLOUDINARY UPLOAD HELPER
// ============================================

function uploadToCloudinary(file, folder) {

  return new Promise((resolve, reject) => {

    const stream =
      cloudinary.uploader.upload_stream(

        {
          folder,
          resource_type: "image"
        },

        (error, result) => {

          if (error) {
            return reject(error);
          }

          resolve(result);
        }

      );

    stream.end(file.buffer);

  });

}

// ============================================
// RIDER DOCUMENT / PHOTO UPLOAD
// ============================================

router.post(
  "/",

  upload.fields([
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

    try {

      const profilePhotoFile =
        req.files?.profilePhoto?.[0];

      const vehiclePhotoFiles =
        req.files?.vehiclePhotos || [];

      // ======================================
      // PROFILE PHOTO
      // ======================================

      let profilePhoto = "";

      if (profilePhotoFile) {

        const result =
          await uploadToCloudinary(
            profilePhotoFile,
            "mieza/riders/profile"
          );

        profilePhoto =
          result.secure_url;
      }

      // ======================================
      // VEHICLE PHOTOS
      // ======================================

      const vehiclePhotos = [];

      for (
        const file of vehiclePhotoFiles
      ) {

        const result =
          await uploadToCloudinary(
            file,
            "mieza/riders/vehicles"
          );

        vehiclePhotos.push(
          result.secure_url
        );

      }

      res.status(200).json({

        message:
          "Rider images uploaded successfully.",

        profilePhoto,

        vehiclePhotos

      });

    } catch (err) {

      console.error(
        "RIDER IMAGE UPLOAD ERROR:",
        err
      );

      res.status(400).json({

        message:
          err.message ||
          "Unable to upload rider images."

      });

    }

  }
);

module.exports = router;