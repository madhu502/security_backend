const multer = require("multer");

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set upload folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); 
  }
});

// Configure multer middleware to handle single file uploads
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // Max file size 10MB

module.exports = upload;
