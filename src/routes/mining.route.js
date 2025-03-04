import express from 'express';
import { MiningController } from '../controllers/miningController.js';

const router = express.Router();
const miningController = new MiningController();

// Route to start mining session
router.post('/start', miningController.startMining);

// Route to watch ad and get bonus
// router.post('/watch-ad', miningController.watchAd);
router.post('/update-mining-session', miningController.updateMiningSession);

// Route to get mining status
router.post('/status', miningController.getMiningStatus);

export default router;