const express = require("express");
const multer = require("multer");

const cloudinary = require("../config/cloudinary");

const router = express.Router();


// ============================================
// MULTER MEMORY STORAGE
// ============================================

const storage = multer.memoryStorage();


// ============================================
// FILE FILTER
// ============================================

const fileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files are allowed."),
      false
    );
  }

};


// ============================================
// MULTER CONFIG
// ============================================

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize: 5 * 1024 * 1024

  }

});


// ============================================
// CLOUDINARY BUFFER UPLOAD
// ============================================

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
              reject(error);
              return;
            }

            resolve(result);

          }

        );

      stream.end(buffer);

    }
  );

};


// ============================================
// UPLOAD RIDER PROFILE PHOTO
// ============================================

router.post(
  "/profile-photo",

  upload.single("profilePhoto"),

  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          message:
            "Profile photo is required."

        });

      }

      const result =
        await uploadToCloudinary(

          req.file.buffer,

          "mieza/riders/profile"

        );

      res.status(201).json({

        message:
          "Profile photo uploaded successfully.",

        url:
          result.secure_url,

        publicId:
          result.public_id

      });

    } catch (err) {

      console.error(
        "Rider profile upload error:",
        err
      );

      res.status(500).json({

        message:
          "Unable to upload profile photo."

      });

    }

  }

);


// ============================================
// UPLOAD VEHICLE PHOTOS
// ============================================

router.post(
  "/vehicle-photos",

  upload.array(
    "vehiclePhotos",
    5
  ),

  async (req, res) => {

    try {

      if (
        !req.files ||
        req.files.length === 0
      ) {

        return res.status(400).json({

          message:
            "At least one vehicle photo is required."

        });

      }

      const uploadedPhotos = [];

      for (
        const file of req.files
      ) {

        const result =
          await uploadToCloudinary(

            file.buffer,

            "mieza/riders/vehicles"

          );

        uploadedPhotos.push({

          url:
            result.secure_url,

          publicId:
            result.public_id

        });

      }

      res.status(201).json({

        message:
          "Vehicle photos uploaded successfully.",

        photos:
          uploadedPhotos

      });

    } catch (err) {

      console.error(
        "Vehicle photos upload error:",
        err
      );

      res.status(500).json({

        message:
          "Unable to upload vehicle photos."

      });

    }

  }

);


// ============================================
// MULTER ERROR HANDLER
// ============================================

router.use(
  (err, req, res, next) => {

    if (
      err instanceof multer.MulterError
    ) {

      if (
        err.code ===
        "LIMIT_FILE_SIZE"
      ) {

        return res.status(400).json({

          message:
            "Each image must be 5MB or smaller."

        });

      }

      if (
        err.code ===
        "LIMIT_UNEXPECTED_FILE"
      ) {

        return res.status(400).json({

          message:
            "Too many or unexpected image files."

        });

      }

      return res.status(400).json({

        message:
          err.message

      });

    }

    if (err) {

      return res.status(400).json({

        message:
          err.message ||
          "Image upload failed."

      });

    }

    next();

  }
);


module.exports = router;