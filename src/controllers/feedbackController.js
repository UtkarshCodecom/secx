// controllers/feedback.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Feedback } from '../models/feedback.model.js';
import { User } from '../models/user.model.js';

export const createFeedback = asyncHandler(async (req, res) => {
  // Get data from request body
  const { userId, description } = req.body;

  // Validate if all required fields are provided
  if (!description) {
    throw new ApiError(400, 'Description is required');
  }

  // Validate if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Create feedback
  const feedback = await Feedback.create({
    userId,
    description,
  });

  if (!feedback) {
    throw new ApiError(400, 'Feedback not created');
  }

  // Return response
  return res
    .status(201)
    .json(new ApiResponse(201, 'Feedback submitted successfully', feedback));
});