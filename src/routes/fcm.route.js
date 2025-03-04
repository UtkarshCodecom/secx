import express from 'express';
import {
  updateFCMToken,
  deleteFCMToken,
} from '../controllers/fcmController.js';

const router = express.Router();

// Route to add/update FCM token
router.post('/token', updateFCMToken);

// Route to delete FCM token
router.post('/delete-token', deleteFCMToken);

export default router;
