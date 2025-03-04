import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Subscription } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import { Pathway } from '../models/pathway.model.js';
import { QuizModule } from '../models/quiz.model.js';
import { Event } from '../models/event.model.js';
import { Podcast } from '../models/podcast.model.js';
import { ContentType } from '../models/contenttypes.model.js';
import { SubscriptionPlan } from '../models/subplans.model.js';

const getContentPricing = async (contentType, contentId, ContentModel) => {
  try {
    const content = await ContentModel.findById(contentId);
    if (!content) {
      throw new ApiError(404, `${contentType} not found`);
    }
    return content.price || 0;
  } catch (error) {
    console.error(`Error fetching price for ${contentType}:`, error);
    return 0;
  }
};

export const verifyUserAccess = asyncHandler(async (req, res) => {
  // STEP 1: Validate Input Data
  const validateInput = async () => {
    const { userId, contentType, contentId } = req.body;

    if (!userId || !contentType || !contentId) {
      throw new ApiError(
        400,
        'Missing required fields: userId, contentType, and contentId are required'
      );
    }

    // Get valid content types from the database
    const validContentTypes = await ContentType.find({}, 'contentType');
    console.log(validContentTypes);

    const validContentTypeNames = validContentTypes.map(
      (type) => type.contentType
    );
    console.log(validContentTypeNames);

    if (!validContentTypeNames.includes(contentType)) {
      throw new ApiError(
        400,
        `Invalid content type. Must be one of: ${validContentTypeNames.join(
          ', '
        )}`
      );
    }

    return { userId, contentType, contentId };
  };

  // STEP 2: Get Content Model
  const getContentModel = (contentType) => {
    const ModelMap = {
      Course,
      Pathway,
      Quiz: QuizModule,
      Event,
      Podcast,
    };

    const ContentModel = ModelMap[contentType];
    if (!ContentModel) {
      throw new ApiError(500, 'Content type model not configured');
    }

    return ContentModel;
  };

  // STEP 3: Validate User and Content
  const validateUserAndContent = async (
    userId,
    contentType,
    contentId,
    ContentModel
  ) => {
    const [user, content] = await Promise.all([
      User.findById(userId),
      ContentModel.findById(contentId),
    ]);

    if (!user) throw new ApiError(404, 'User not found');
    if (!content) throw new ApiError(404, `${contentType} not found`);

    return { user, content };
  };

  // STEP 4: Check Free Content
  const checkFreeContent = async (content, user, contentType) => {
    if (content.isFree) {
      const requiredPlans = await getRequiredPlans(contentType);
      return new ApiResponse(200, 'Content is free to access', {
        isUnlock: true,
        premiumPrice: content?.price || 0,
        showAds: !user.isPremium,
        subscriptionPlans: requiredPlans,
      });
    }
    return null;
  };

  // STEP 5: Check Individual Subscription
  const checkIndividualSubscription = async (
    userId,
    contentType,
    contentId,
    ContentModel
  ) => {
    const subscription = await Subscription.findOne({
      user: userId,
      individualSubscriptions: {
        $elemMatch: {
          contentId: contentId,
          contentType: contentType,
          status: 'active',
          endDate: { $gt: new Date() },
        },
      },
    });

    if (subscription) {
      const requiredPlans = await getRequiredPlans(contentType);
      const premiumPrice = await getContentPricing(
        contentType,
        contentId,
        ContentModel
      );
      return new ApiResponse(
        200,
        'Access granted via individual subscription',
        {
          isUnlock: true,
          // accessType: 'individual',
          premiumPrice,
          showAds: false,
          subscriptionPlans: requiredPlans,
        }
      );
    }
    return null;
  };

  // STEP 6: Check Plan Subscription
  const checkPlanSubscription = async (
    user,
    contentType,
    contentId,
    ContentModel
  ) => {
    if (!user.isPremium) return null;

    const planSubscription = await Subscription.findOne({
      user: user._id,
      'plan.type': { $exists: true },
      status: 'active',
      'plan.endDate': { $gt: new Date() },
    }).populate({
      path: 'plan.type',
      select: 'name allowedContent',
    });

    // Check if user has an active plan with access to this content type
    const hasAccess = planSubscription?.plan?.type?.allowedContent?.some(
      (content) => content.contentType === contentType
    );

    if (hasAccess) {
      const requiredPlans = await getRequiredPlans(contentType);
      const premiumPrice = await getContentPricing(
        contentType,
        contentId,
        ContentModel
      );
      return new ApiResponse(
        200,
        `Access granted via ${planSubscription.plan.type.name} plan`,
        {
          isUnlock: true,
          accessType: 'plan',
          planName: planSubscription.plan.type.name,
          premiumPrice,
          showAds: false,
          subscriptionPlans: requiredPlans,
        }
      );
    }
    return null;
  };

  // Helper function for required plans
  const getRequiredPlans = async (contentType) => {
    // const planMap = {
    //   Course: ['Student Plan', 'Elite Plan'],
    //   Pathway: ['Student Plan', 'Elite Plan'],
    //   Quiz: ['Student Plan', 'Elite Plan'],
    //   Event: ['Student Plan', 'Work Plan', 'Elite Plan'],
    //   Podcast: ['Work Plan', 'Elite Plan'],
    // };

    // return planMap[contentType] || [];

    try {
      const plans = await SubscriptionPlan.find({
        'allowedContent.contentType': contentType,
      }).select('name');

      return plans.map((plan) => plan.name);
    } catch (error) {
      console.error('Error fetching required plans:', error);
      return [];
    }
  };

  // Execute steps in sequence
  const { userId, contentType, contentId } = await validateInput();
  const ContentModel = await getContentModel(contentType);
  const { user, content } = await validateUserAndContent(
    userId,
    contentType,
    contentId,
    ContentModel
  );

  // Check access rights in sequence
  const freeAccess = await checkFreeContent(
    content,
    user,
    contentType,
    contentId,
    ContentModel
  );
  if (freeAccess) return res.status(200).json(freeAccess);

  const individualAccess = await checkIndividualSubscription(
    userId,
    contentType,
    contentId,
    ContentModel
  );
  if (individualAccess) return res.status(200).json(individualAccess);

  const planAccess = await checkPlanSubscription(
    user,
    contentType,
    contentId,
    ContentModel
  );
  if (planAccess) return res.status(200).json(planAccess);

  // If no access is granted
  const requiredPlans = await getRequiredPlans(contentType);
  const premiumPrice = await getContentPricing(
    contentType,
    contentId,
    ContentModel
  );
  return res.status(200).json(
    new ApiResponse(200, 'No valid subscription found for this content', {
      isUnlock: false,
      premiumPrice,
      showAds: !user.isPremium,
      subscriptionPlans: requiredPlans,
    })
  );
});

export const verifyUserAccessMethod = async (
  userId,
  contentType,
  contentId
) => {
  // STEP 1: Validate Input Data
  const validateInput = async () => {
    if (!userId || !contentType || !contentId) {
      throw new ApiError(
        400,
        'Missing required fields: userId, contentType, and contentId are required'
      );
    }

    // Get valid content types from the database
    const validContentTypes = await ContentType.find({}, 'contentType');
    const validContentTypeNames = validContentTypes.map(
      (type) => type.contentType
    );

    if (!validContentTypeNames.includes(contentType)) {
      throw new ApiError(
        400,
        `Invalid content type. Must be one of: ${validContentTypeNames.join(
          ', '
        )}`
      );
    }

    return { userId, contentType, contentId };
  };

  // STEP 2: Get Content Model
  const getContentModel = (contentType) => {
    const ModelMap = {
      Course,
      Pathway,
      QuizModule,
      Event,
      Podcast,
    };

    const ContentModel = ModelMap[contentType];
    if (!ContentModel) {
      throw new ApiError(500, 'Content type model not configured');
    }

    return ContentModel;
  };

  // STEP 3: Validate User and Content
  const validateUserAndContent = async (
    userId,
    contentType,
    contentId,
    ContentModel
  ) => {
    const [user, content] = await Promise.all([
      User.findById(userId),
      ContentModel.findById(contentId),
    ]);

    if (!user) throw new ApiError(404, 'User not found');
    if (!content) throw new ApiError(404, `${contentType} not found`);

    return { user, content };
  };

  // STEP 4: Check Free Content
  const checkFreeContent = async (
    content,
    user,
    contentType,
    contentId,
    userId
  ) => {
    if (content.isFree) {
      const requiredPlans = await getRequiredPlans(contentType);

      const individualSubscription = await Subscription.findOne({
        userId,
        individualSubscriptions: {
          $elemMatch: {
            contentId,
            contentType,
            status: 'active',
            endDate: { $gt: new Date() },
          },
        },
      });

      console.log('individualSubscription: ', individualSubscription);
      if (individualSubscription) {
        return {
          isUnlock: true,
          premiumPrice: content?.price || 0,
          showAds: false,
          subscriptionPlans: requiredPlans,
        };
      } else {
        return {
          isUnlock: true,
          premiumPrice: content?.price || 0,
          showAds: !user.isPremium,
          subscriptionPlans: requiredPlans,
        };
      }
    }
    return null;
  };

  // STEP 5: Check Individual Subscription
  const checkIndividualSubscription = async (
    userId,
    contentType,
    contentId,
    ContentModel
  ) => {
    const subscription = await Subscription.findOne({
      userId,
      individualSubscriptions: {
        $elemMatch: {
          contentId: contentId,
          contentType: contentType,
          status: 'active',
          endDate: { $gt: new Date() },
        },
      },
    });

    // console.log('subscription: ', subscription);

    if (subscription) {
      const requiredPlans = await getRequiredPlans(contentType);
      const premiumPrice = await getContentPricing(
        contentType,
        contentId,
        ContentModel
      );
      return {
        isUnlock: true,
        premiumPrice,
        showAds: false,
        subscriptionPlans: requiredPlans,
      };
    }
    return null;
  };

  // STEP 6: Check Plan Subscription
  const checkPlanSubscription = async (
    user,
    contentType,
    contentId,
    ContentModel
  ) => {
    if (!user.isPremium) return null;

    const planSubscription = await Subscription.findOne({
      userId,
      'plan.type': { $exists: true },
      status: 'active',
      'plan.endDate': { $gt: new Date() },
    }).populate({
      path: 'plan.type',
      select: 'name allowedContent',
    });

    const hasAccess = planSubscription?.plan?.type?.allowedContent?.some(
      (content) => content.contentType === contentType
    );

    if (hasAccess) {
      const requiredPlans = await getRequiredPlans(contentType);
      const premiumPrice = await getContentPricing(
        contentType,
        contentId,
        ContentModel
      );
      return {
        isUnlock: true,
        accessType: 'plan',
        planName: planSubscription.plan.type.name,
        premiumPrice,
        showAds: false,
        subscriptionPlans: requiredPlans,
      };
    }
    return null;
  };

  const getRequiredPlans = async (contentType) => {
    try {
      const plans = await SubscriptionPlan.find({
        'allowedContent.contentType': contentType,
      }).select('name');

      return plans.map((plan) => plan.name);
    } catch (error) {
      console.error('Error fetching required plans:', error);
      return [];
    }
  };

  // Execute steps in sequence
  const {
    userId: validatedUserId,
    contentType: validatedContentType,
    contentId: validatedContentId,
  } = await validateInput();

  const ContentModel = await getContentModel(validatedContentType);
  const { user, content } = await validateUserAndContent(
    validatedUserId,
    validatedContentType,
    validatedContentId,
    ContentModel
  );

  const freeAccess = await checkFreeContent(
    content,
    user,
    validatedContentType,
    validatedContentId,
    validatedUserId
  );
  if (freeAccess) return freeAccess;

  const individualAccess = await checkIndividualSubscription(
    validatedUserId,
    validatedContentType,
    validatedContentId,
    ContentModel
  );
  if (individualAccess) return individualAccess;

  const planAccess = await checkPlanSubscription(
    user,
    validatedContentType,
    validatedContentId,
    ContentModel
  );
  if (planAccess) return planAccess;

  const requiredPlans = await getRequiredPlans(validatedContentType);
  const premiumPrice = await getContentPricing(
    validatedContentType,
    validatedContentId,
    ContentModel
  );
  return {
    isUnlock: false,
    premiumPrice,
    showAds: !user.isPremium,
    subscriptionPlans: requiredPlans,
  };
};
