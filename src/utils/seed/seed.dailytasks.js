import { asyncHandler } from '../asyncHandler.js';
import { ApiResponse } from '../ApiResponse.js';
import { DailyTask } from '../../models/dailytask.model.js';
import { ApiError } from '../ApiError.js';

export const seedDailyTasks = asyncHandler(async (req, res) => {
  // Define daily tasks
const dailyTasks = [
  {
    title: 'Daily Login',
    description: 'Login to the app daily to earn rewards',
    hugeIcon: 'strokeRoundedLoginSquare02',
    taskType: 'daily',
    taskIdentifier: 'daily_login',
    requiredCount: 1, // Default is 1, explicitly added for clarity
    rewardAmount: 10,
  },
  {
    title: 'Complete Profile',
    description: 'Complete your profile to earn one-time reward',
    hugeIcon: 'strokeRoundedUserAccount',
    taskType: 'lifetime',
    taskIdentifier: 'lifetime_google_review', // Assuming 'Complete Profile' maps to a lifetime identifier
      requiredCount: 1,
      rewardAmount: 10,
      },
    {
      title: 'Watch Video',
      description: 'Watch a complete video to earn rewards',
      hugeIcon: 'strokeRoundedVideo02',
      taskType: 'daily',
      taskIdentifier: 'daily_video',
      requiredCount: 1, // Adjust if multiple videos are required
      rewardAmount: 25,
  },
  {
    title: 'Take Quiz',
    description: 'Complete a quiz to earn rewards',
    hugeIcon: 'strokeRoundedQuiz02',
    taskType: 'daily',
    taskIdentifier: 'daily_quiz',
    requiredCount: 1,
    rewardAmount: 10,
  },
  {
    title: 'Share App',
    description: 'Share the app with friends',
    hugeIcon: 'strokeRoundedShare01',
    taskType: 'lifetime',
    taskIdentifier: 'lifetime_social_share', // Maps to a lifetime identifier for sharing
    requiredCount: 1,
    rewardAmount: 25,
  },
];


  // Delete existing tasks before seeding
  await DailyTask.deleteMany({});

  // Insert new tasks
  const createdTasks = await DailyTask.insertMany(dailyTasks);

  if (!createdTasks) {
    throw new ApiError(500, 'Failed to create daily tasks');
  }

  const response = new ApiResponse(
    201,
    'Daily tasks created successfully',
    createdTasks
  );
  return res.status(response.statusCode).json(response);
});
