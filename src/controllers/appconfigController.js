import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppConfig } from '../models/appconfig.model.js';

export const getAppConfig = asyncHandler(async (req, res) => {
  // Get config (there should only be one document)
  const config = await AppConfig.findOne({}).select('-createdBy -updatedBy'); // Exclude sensitive fields

  if (!config) {
    throw new ApiError(404, 'Application configuration not found');
  }

  // Filter out sensitive information based on app mode
  if (config.appMode !== 'development') {
    delete config.analytics;
    delete config.paymentGateways;
  }

  // Return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Application configuration retrieved successfully',
        config
      )
    );
});
