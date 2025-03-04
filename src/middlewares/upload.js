// src/middlewares/upload.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dynamically set upload folder based on type (if required)
    const type = req.params.type || 'files'; // Default folder if no type is specified
    const uploadDir = path.join('uploads', type);

    // Create directory if it doesn't exist
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir); // Directory to save uploaded files
    } catch (err) {
      cb(new Error(`Failed to create upload directory: ${err.message}`));
    }
  },
  filename: (req, file, cb) => {
    // Sanitize and generate unique file name
    const uniqueSuffix = `${Date.now()}-${file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    )}`;
    cb(null, uniqueSuffix); // Custom file name
  },
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|webp|png|avif|gif|svg|bmp|tiff/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedExtensions.test(file.mimetype);

  if (file.size > MAX_FILE_SIZE) {
    cb(new ApiError(400, 'File size exceeds the allowed limit (5MB)'));
  }

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'Only image formats are allowed (JPEG, JPG, PNG, WEBP, AVIF, GIF, SVG, BMP, TIFF)'
      )
    );
  }
};

// Initialize Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export default upload;
