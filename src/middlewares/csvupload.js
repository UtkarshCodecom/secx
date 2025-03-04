// src/middlewares/upload.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/csv';

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// // File filter for CSV
// const fileFilter = (req, file, cb) => {
//   if (
//     path.extname(file.originalname).toLowerCase() === '.csv' &&
//     file.mimetype === 'text/csv'
//   ) {
//     cb(null, true);
//   } else {
//     cb(new ApiError(400, 'Only CSV files are allowed'));
//   }
// };

// Initialize Multer
const upload = multer({
  storage,
  //   fileFilter,
  //   limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

export default upload;
