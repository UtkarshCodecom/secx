// routes/checklistRoutes.js
import express from 'express';
import {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/checklistController.js';

const router = express.Router();

router.post('/add-task', addTask); // Add tasks for a user
router.get('/get-tasks/:userID', getTasks); // Get tasks for a user
router.post('/update-task/:userID/:taskID', updateTask); // Update a specific task by index
router.post('/delete-task/:userID/:taskID', deleteTask); // Delete a specific task

export default router;
