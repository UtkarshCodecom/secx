import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { DailyTask } from '../models/dailytask.model.js';
import { UserTaskProgress } from '../models/usertaskprogress.model.js';
import { User } from '../models/user.model.js';
import { validateId } from '../utils/validateId.js';
import { Wallet } from '../models/wallet.model.js';

// Get all tasks with progress
export const getAllTasks = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Validate user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get all tasks
  const tasks = await DailyTask.find();

  // Get user's progress for all tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const userProgress = await UserTaskProgress.find({
    userId,
  });

  // Map tasks with progress
  const tasksWithProgress = tasks.map((task) => {
    const progress = userProgress.find(
      (p) => p.taskId.toString() === task._id.toString()
    );

    // Check if task is completed based on type
    let isCompleted = false;
    if (progress) {
      if (task.taskType === 'lifetime') {
        isCompleted = progress.isCompleted;
      } else {
        // daily task
        const lastClaimed = new Date(progress.lastClaimedAt);
        lastClaimed.setHours(0, 0, 0, 0);
        isCompleted = lastClaimed.getTime() === today.getTime();
      }
    }

    return {
      _id: task._id,
      title: task.title,
      description: task.description,
      hugeIcon: task.hugeIcon,
      taskType: task.taskType,
      taskIdentifier: task.taskIdentifier,
      requiredCount: task.requiredCount,
      // rewardTime: task.rewardTime,
      isCompleted,
      lastClaimedAt: progress?.lastClaimedAt || null,
      completionCount: progress?.completionCount || 0,
    };
  });

  // Separate daily and lifetime tasks
  const dailyTasks = tasksWithProgress.filter(
    (task) => task.taskType === 'daily'
  );
  const lifetimeTasks = tasksWithProgress.filter(
    (task) => task.taskType === 'lifetime'
  );

  const response = new ApiResponse(200, 'Tasks fetched successfully', {
    dailyTasks,
    lifetimeTasks,
  });

  return res.status(response.statusCode).json(response);
});

// Claim task
export const claimTask = asyncHandler(async (req, res) => {
  const { userId, taskId } = req.body;

  // Validate IDs
  validateId(userId, 'User ID');
  validateId(taskId, 'Task ID');

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if task exists
  const task = await DailyTask.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check existing progress
  let progress = await UserTaskProgress.findOne({
    userId,
    taskId,
  });

  // Validate based on task type
  if (progress) {
    if (task.taskType === 'lifetime' && progress.isCompleted) {
      throw new ApiError(400, 'This task has already been claimed');
    }

    if (task.taskType === 'daily') {
      const lastClaimed = new Date(progress.lastClaimedAt);
      lastClaimed.setHours(0, 0, 0, 0);

      if (lastClaimed.getTime() === today.getTime()) {
        throw new ApiError(400, 'Daily task already claimed today');
      }
    }
  }

  // Create or update progress
  if (!progress) {
    progress = new UserTaskProgress({
      userId,
      taskId,
      lastClaimedAt: new Date(),
      completionCount: 1,
      isCompleted: true,
    });
  } else {
    progress.lastClaimedAt = new Date();
    progress.completionCount += 1;
    progress.isCompleted = true;
  }

  // update the wallet
  const wallet = await Wallet.findOne({ userId });
  if (wallet) {
    wallet.balance += task.rewardAmount;
    await wallet.save();
  }

  await progress.save();

  // Add premium time to user (implement your reward logic here)

  const response = new ApiResponse(200, 'Task claimed successfully', {
    taskId: task._id,
    taskType: task.taskType,
    // rewardTime: task.rewardTime,
    lastClaimedAt: progress.lastClaimedAt,
    completionCount: progress.completionCount,
  });

  return res.status(response.statusCode).json(response);
});

// Auto-claim login task (to be called when user logs in)
export const autoClaimLoginTask = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const loginTask = await DailyTask.findOne({ taskIdentifier: 'daily_login' });
  if (!loginTask) throw new ApiError(404, 'Login task not found');

  const dailyTaskProgress = await UserTaskProgress.findOne({ userId });
  if (!dailyTaskProgress) {
    await UserTaskProgress.create({ userId, taskId: loginTask._id });
  }

});
