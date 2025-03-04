import express from 'express';
import { verifyUserAccess } from '../controllers/contentController.js';

const router = express.Router();

router.post('/verify-access', verifyUserAccess);

export default router;
