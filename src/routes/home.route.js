import express from 'express';
import { getHomeScreenData } from '../controllers/homeController.js';

const router = express.Router();

// Route to get all events
router.post('/get-home-screen-data', getHomeScreenData);

export default router;
