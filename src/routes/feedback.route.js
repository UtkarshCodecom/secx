import express from 'express'; // Importing the Express framework
import { createFeedback } from '../controllers/feedbackController.js';

const router = express.Router(); // Creating a new router instance

// Route to create feedback
router.post('/create-feedback', createFeedback);

export default router;  
