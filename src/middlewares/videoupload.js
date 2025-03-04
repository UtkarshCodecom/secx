// src/middlewares/videoUpload.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {ApiError} from '../utils/ApiError.js'; // Assuming you have a custom error handler

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join('uploads', 'temp', 'videos');

    // Create directory if it doesn't exist
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (err) {
      cb(new Error(`Failed to create upload directory: ${err.message}`));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueSuffix); // Custom file name
  },
});

// File filter for validation
const fileFilter = (req, file, cb) => {
const allowedExtensions = /mp4|mov|avi|mkv/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, MOV, AVI, MKV) are allowed'));
  }
};

// Initialize Multer
const videoUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // Limit file size to 2GB
});

export default videoUpload;
