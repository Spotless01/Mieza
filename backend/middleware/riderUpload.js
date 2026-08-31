const multer = require("multer");

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
];

const fileFilter = (req, file, cb) => {

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      )
    );
  }

  cb(null, true);
};

const riderUpload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,

    files: 6
  }
});

module.exports = riderUpload;