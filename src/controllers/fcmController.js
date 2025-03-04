import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { FCMToken } from '../models/fcmtoken.model.js';
import { User } from '../models/user.model.js';
import { validateId } from '../utils/validateId.js';

// Controller to add/update FCM token
export const updateFCMToken = asyncHandler(async (req, res) => {
  const { userId, token, deviceType = '' } = req.body;

  // Validate required fields
  if (!userId || !token || !deviceType) {
    throw new ApiError(400, 'userId, token, and deviceType are required');
  }

  // Validate userId
  validateId(userId, 'User ID');

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Validate device type
  if (!deviceType) {
    throw new ApiError(400, 'Invalid device type');
  }

  // Update or create FCM token
  const fcmToken = await FCMToken.findOneAndUpdate(
    { userId },
    {
      userId,
      token,
      deviceType,
      isActive: true,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  const response = new ApiResponse(
    200,
    'FCM token updated successfully',
    fcmToken
  );
  return res.status(response.statusCode).json(response);
});

// Controller to delete FCM token
export const deleteFCMToken = asyncHandler(async (req, res) => {
  const { userId, token } = req.body;

  // Validate required fields
  if (!userId || !token) {
    throw new ApiError(400, 'userId and token are required');
  }

  // Validate userId
  validateId(userId, 'User ID');

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Find and update the token status
  const fcmToken = await FCMToken.findOneAndDelete({userId, token});

  if (!fcmToken) {
    throw new ApiError(404, 'FCM token not found');
  }

  const response = new ApiResponse(
    200,
    'FCM token deleted successfully'
  );
  return res.status(response.statusCode).json(response);
});