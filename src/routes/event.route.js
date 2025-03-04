import express from 'express';
import {
  getAllEvents,
  getEventById,
  registerEvent,
} from '../controllers/eventController.js';
import { seedEventData } from '../utils/seed/seed.event.js';

const router = express.Router();

router.get('/seed-events', seedEventData);

// Route to get all events
router.get('/get-all-events', getAllEvents);

// Route to get a specific event by ID
router.post('/get-event', getEventById);

// Route to register for an event
router.post('/register-event', registerEvent);

export default router;
