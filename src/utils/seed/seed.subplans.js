import { asyncHandler } from '../asyncHandler.js';
import { ApiResponse } from '../ApiResponse.js';
import { SubscriptionPlan } from '../../models/subplans.model.js';
import { ContentType } from '../../models/contenttypes.model.js';

export const seedSubscriptionPlans = asyncHandler(async (req, res) => {
  // First get all content types from database
  const contentTypes = await ContentType.find({});

  if (!contentTypes.length) {
    throw new ApiError(
      404,
      'No content types found. Please seed content types first'
    );
  }

  // Create a map of content types for easier access
  const contentTypeMap = contentTypes.reduce((acc, content) => {
    if (!acc[content.contentType]) {
      acc[content.contentType] = content._id;
    }
    return acc;
  }, {});

  // Define subscription plans with their allowed content
  const subscriptionPlans = [
    {
      name: 'Student Plan',
      allowedContent: [
        {
          contentTypeId: contentTypeMap['Course'],
          contentType: 'Course',
        },
        {
          contentTypeId: contentTypeMap['Pathway'],
          contentType: 'Pathway',
        },
        {
          contentTypeId: contentTypeMap['Quiz'],
          contentType: 'Quiz',
        },
        {
          contentTypeId: contentTypeMap['Event'],
          contentType: 'Event',
        },
      ],
      description: 'Affordable plan for students to access basic content',
      monthlyPrice: 299,
      yearlyPrice: 2999,
      isMonthly: false,
      isYearly: true,
    },
    {
      name: 'Work Plan',
      allowedContent: [
        {
          contentTypeId: contentTypeMap['Event'],
          contentType: 'Event',
        },
        {
          contentTypeId: contentTypeMap['Podcast'],
          contentType: 'Podcast',
        },
      ],
      description: 'Perfect plan for working professionals',
      monthlyPrice: 599,
      yearlyPrice: 5999,
      isMonthly: true,
      isYearly: false,
    },
    {
      name: 'Elite Plan',
      allowedContent: Object.entries(contentTypeMap).map(([type, id]) => ({
        contentTypeId: id,
        contentType: type,
      })),
      description: 'All-inclusive plan for premium content access',
      monthlyPrice: 999,
      yearlyPrice: 9999,
      isMonthly: true,
      isYearly: false,
    },
  ];

  // Delete existing plans before seeding
  await SubscriptionPlan.deleteMany({});

  // Insert new plans
  const createdPlans = await SubscriptionPlan.insertMany(subscriptionPlans);

  if (!createdPlans) {
    throw new ApiError(500, 'Failed to create subscription plans');
  }

  const response = new ApiResponse(
    201,
    'Subscription plans created successfully',
    createdPlans
  );
  return res.status(response.statusCode).json(response);
});
