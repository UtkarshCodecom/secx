import express from 'express';
import {
  getAllTasks,
  claimTask,
  autoClaimLoginTask,
} from '../controllers/dailytaskController.js';
import { seedDailyTasks } from '../utils/seed/seed.dailytasks.js';

const router = express.Router();

// Get all daily tasks
router.post('/get-all-tasks', getAllTasks);

// Claim a task
router.post('/claim-task', claimTask);

// Auto-claim login task (to be called when user logs in)
// router.post('/auto-claim-login-task', autoClaimLoginTask);

// Seed daily tasks
router.get('/seed-tasks', seedDailyTasks);

export default router;
