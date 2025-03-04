import express from 'express';
import {
  getAllPodcasts,
  getPodcastById,
} from '../controllers/podcastController.js';
import { seedPodcastData } from '../utils/seed/seed.podcast.js';

const router = express.Router();

router.get('/seed-podcasts', seedPodcastData);

router.get('/get-all-podcasts', getAllPodcasts); // Route to fetch all podcasts
router.post('/get-podcast', getPodcastById); // Route to fetch podcast by ID

export default router;
