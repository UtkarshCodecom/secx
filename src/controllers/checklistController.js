import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Checklist } from '../models/checklist.model.js';
import { User } from '../models/user.model.js';
import { validateId } from '../utils/validateId.js';
import mongoose from 'mongoose';

// Add new tasks for a user
export const addTask = asyncHandler(async (req, res) => {
  const { userID, task } = req.body; // we can keep the name as 'tasks' in the API for consistency
  if (!userID) {
    throw new ApiError(400, 'User ID is required');
  }

  validateId(userID, 'User ID'); // Validate user ID

  if (!task) {
    throw new ApiError(400, 'Task is required');
  }

  const user = await User.findById(userID);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  let checklist = await Checklist.findOne({ userID });

  let newTask; // Variable to store the added task

  if (!checklist) {
    // Create new checklist with single task in tasks array
    newTask = { ...task, _id: new mongoose.Types.ObjectId() }; // Generate a new _id
    checklist = new Checklist({
      userID,
      tasks: [newTask],
    });
  } else {
    // Simply push the single task
    newTask = { ...task, _id: new mongoose.Types.ObjectId() }; // Generate a new _id
    checklist.tasks.push(newTask);
  }

  await checklist.save(); // Save the updated checklist

  const response = new ApiResponse(201, 'Tasks added successfully', newTask);
  res.status(response.statusCode).json(response);
});

// Get all tasks for a specific user
export const getTasks = asyncHandler(async (req, res) => {
  const userID = req.params.userID;

  validateId(userID, 'User ID'); // Validate user ID

  const checklist = await Checklist.findOne({ userID });

  if (!checklist) {
    throw new ApiError(404, 'Checklist not found for this user');
  }

  const response = new ApiResponse(
    200,
    'Tasks fetched successfully',
    checklist.tasks
  );
  res.status(response.statusCode).json(response);
});

// Update a specific task
export const updateTask = asyncHandler(async (req, res) => {
  const { userID, taskID } = req.params; // taskID is the _id of the task
  const { ProgramName, BugName, Status, Date } = req.body;

  validateId(userID, 'User ID'); // Validate user ID

  const checklist = await Checklist.findOne({ userID }); // Find the user's checklist

  if (!checklist) {
    throw new ApiError(404, 'Checklist not found for this user');
  }

  validateId(taskID, 'Task ID'); // Validate task ID

  const task = checklist.tasks.id(taskID); // Find the task by its _id
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Update task fields
  task.ProgramName = ProgramName || task.ProgramName;
  task.BugName = BugName || task.BugName;
  task.Status = Status || task.Status;
  task.Date = Date || task.Date;

  await checklist.save();

  const response = new ApiResponse(200, 'Task updated successfully', task);
  res.status(response.statusCode).json(response);
});

// Delete a specific task
export const deleteTask = asyncHandler(async (req, res) => {
  const { userID, taskID } = req.params;

  // Validate IDs
  if (!userID) {
    throw new ApiError(400, 'User ID is required');
  }
  // Validate IDs
  if (!taskID) {
    throw new ApiError(400, 'Task ID is required');
  }

  validateId(userID, 'User ID'); // Validate user ID
  validateId(taskID, 'Task ID'); // Validate task ID

  const checklist = await Checklist.findOne({ userID }); // Find the user's checklist

  if (!checklist) {
    throw new ApiError(404, 'Checklist not found for this user');
  }

  // Find and remove the task
  const taskIndex = checklist.tasks.findIndex(
    (task) => task._id.toString() === taskID
  );

  if (taskIndex === -1) {
    throw new ApiError(404, 'Task not found in checklist');
  }

  // Remove the task
  checklist.tasks.splice(taskIndex, 1);

  // Save the updated checklist
  await checklist.save();

  // Return success response
  return res.status(200).json(
    new ApiResponse(200, 'Task deleted successfully', {
      deletedTaskId: taskID,
      // remainingTasks: checklist.tasks,
    })
  );
});
