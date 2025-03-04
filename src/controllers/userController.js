import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { uploadFileToAwsS3 } from '../config/s3Use.js';
import path from 'path';
import { awsFolderNames } from '../services/awsS3connect.js';
import { validateId } from '../utils/validateId.js';
import { UserDetail } from '../models/userdetail.model.js';
import { Streak } from '../models/userstreak.model.js';
import { AIAccess } from '../models/aiaccess.model.js';
import {
  handleUserRegistration,
  initializeWallet,
} from './referralController.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { Wallet } from '../models/wallet.model.js';
import { sendNotification } from '../services/fcmService.js';
import { getUserMiningStatus } from './miningController.js';
import { DefaultSetting } from '../models/defaultsetting.model.js';
import { SubscriptionPlan } from '../models/subplans.model.js';
import { UserTaskProgress } from '../models/usertaskprogress.model.js';
import { DailyTask } from '../models/dailytask.model.js';
import { Subscription } from '../models/subscription.model.js';

// Temporary folder for uploads
const generateUniqueReferralCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    // Generate code from UUID to ensure uniqueness
    code = uuidv4().substring(0, 8).toUpperCase();

    // Check if code exists
    const existingUser = await User.findOne({ referralCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return code;
};

// Import required modules and utilities
// 1. Get User Profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id; // Get user ID from the route parameter

  validateId(userId, 'User ID'); // Validate user ID

  // Fetch the user from the database and populate userDetails
  const user = await User.findById(userId)
    .select('-password -__v -createdAt -updatedAt') // Exclude sensitive and unnecessary fields
    .populate({
      path: 'userDetails', // Populate the userDetails model
      select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
    })
    .populate({
      path: 'subscription',
      populate: [
        {
          path: 'plan.type', // Populate the SubscriptionPlan details
          model: 'PlanType',
          select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
        },
        {
          path: 'individualSubscriptions.contentId', // Populate contentId in individualSubscriptions
          select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
        },
      ],
    });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Handle streak logic
  let streak = await Streak.findOne({ userId });

  // If no streak document exists, create one
  if (!streak) {
    streak = await Streak.create({
      userId,
      streakCount: 1,
      dates: [new Date().toISOString().split('T')[0]],
    });
  }
  await streak.updateDailyStreak(); // Update streak but don't use return value

  // user mining status
  const miningStatus = await getUserMiningStatus(userId);

  // Fetch or create daily login progress
  const dailyLoginTask = await DailyTask.findOne({
    taskIdentifier: 'daily_login',
  });

  if (dailyLoginTask) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let userTaskProgress = await UserTaskProgress.findOne({
      userId,
      taskId: dailyLoginTask._id,
    });

    if (!userTaskProgress) {
      // Create a new record if none exists
      await UserTaskProgress.create({
        userId,
        taskId: dailyLoginTask._id,
        lastClaimedAt: today,
        completionCount: 1,
        isCompleted: true,
      });
    } else {
      // Check if the user already logged in today
      const lastLogin = new Date(userTaskProgress.lastClaimedAt);
      lastLogin.setHours(0, 0, 0, 0);

      if (lastLogin.getTime() !== today.getTime()) {
        // Update login date if it's a new day
        userTaskProgress.lastClaimedAt = today;
        userTaskProgress.completionCount += 1;
        userTaskProgress.isCompleted = true;
        await userTaskProgress.save();
      }
    }
  }

  // Extract and organize the response data
  const userProfile = {
    userId: user._id,
    email: user.email,
    provider: user.provider,
    isPremium: user.isPremium || false,
    referralCode: user.referralCode || '',
    userDetails: {
      fullname: user.userDetails?.fullname || null,
      profileImage: user.userDetails?.profileImage || null,
      phoneNumber: user.userDetails?.phoneNumber || null,
      isOnboarded: user.userDetails?.isOnboarded || false,
      city: user.userDetails?.city || null,
      state: user.userDetails?.state || null,
      country: user.userDetails?.country || null,
    },
    subscription: user.subscription[0]
      ? {
          plan: user.subscription[0].plan
            ? {
                planName: user.subscription[0].plan.type.name,
                startDate: user.subscription[0].plan.startDate,
                endDate: user.subscription[0].plan.endDate,
                status: user.subscription[0].plan.status,
              }
            : null,
          individualSubscriptions:
            user.subscription[0].individualSubscriptions?.map((sub) => ({
              contentType: sub.contentType,
              name: sub.contentId.title || sub.contentId.name || 'N/A',
              startDate: sub.startDate,
              endDate: sub.endDate,
              status: sub.status,
            })) || [],
        }
      : null,
    miningStatus,
  };

  // console.log('User Profile: ', userProfile);

  const response = new ApiResponse(
    200,
    'User profile fetched successfully',
    userProfile
  );
  return res.status(response.statusCode).json(response);
});

// 2. Update User Details
export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const {
    fullname,
    phoneNumber,
    isOnboarded,
    isPremium,
    city,
    State,
    country, // Provide default empty object for userDetails
    referredBy = '',
  } = req.body;

  validateId(userId, 'User ID'); // Validate user ID

  // Validate required fields
  if (!fullname) {
    throw new ApiError(400, 'Full name is required');
  }

  // Phone number validation (assuming a simple format)
  if (phoneNumber && !phoneNumber.match(/^\+?[\d\s-]{10,}$/)) {
    throw new ApiError(400, 'Invalid phone number format');
  }

  // Fetch the User to get the userDetails reference
  const user = await User.findById(userId).select('userDetails wallet');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.referralCode) {
    user.referralCode = await generateUniqueReferralCode();
    await user.save();
  }

  if (referredBy !== '') {
    await handleUserRegistration(userId, referredBy);
  } else {
    const session = await mongoose.startSession();
    session.startTransaction();
    if (!user.wallet) {
      await initializeWallet(user._id, session);
    }
    await session.commitTransaction();
    session.endSession();
  }

  // Get the reference to UserDetail (userDetails field in User document)
  const userDetailId = user.userDetails;

  // Construct the update object for UserDetail
  const userDetailUpdate = {
    fullname,
    phoneNumber: phoneNumber || null,
    isOnboarded: isOnboarded || false,
    isPremium: isPremium || false,
    city: city || null,
    state: State || null,
    country: country || null,
  };

  // Remove undefined fields
  Object.keys(userDetailUpdate).forEach(
    (key) => userDetailUpdate[key] === undefined && delete userDetailUpdate[key]
  );

  // Update the UserDetail document by its ID
  const updatedUserDetail = await UserDetail.findByIdAndUpdate(
    userDetailId, // The UserDetail document ID from the User document
    userDetailUpdate,
    { new: true, runValidators: true }
  );

  if (!updatedUserDetail) {
    throw new ApiError(404, 'UserDetail not found');
  }

  // Update the User document (no need to modify the userDetails reference)
  const updatedUser = await User.findById(userId).select(
    '-password -__v -createdAt -updatedAt'
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  // update user daily task progress
  const dailyTaskProgress = await UserTaskProgress.findOne({ userId });

  const completeProfileTask = await DailyTask.findOne({
    taskIdentifier: 'complete_profile',
  });

  if (completeProfileTask) {
    if (!dailyTaskProgress) {
      await UserTaskProgress.create({
        userId,
        taskId: completeProfileTask._id,
        lastClaimedAt: new Date(),
        completionCount: 1,
        isCompleted: true,
      });
    }
  }

  // Populate subscriptions (if applicable)
  const populatedUser = await User.findById(user._id).populate({
    path: 'subscription',
    populate: [
      {
        path: 'plan.type', // Populate the SubscriptionPlan details
        model: 'PlanType',
        select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
      },
      {
        path: 'individualSubscriptions.contentId', // Populate contentId in individualSubscriptions
        select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
      },
    ],
  });

  // Extract and organize the response data
  const userProfile = {
    userId: updatedUser._id,
    // email: updatedUser.email,
    // provider: updatedUser.provider,
    // isPremium: updatedUser.isPremium || false,
    referralCode: updatedUser.referralCode || '',
    userDetails: {
      fullname: updatedUserDetail.fullname,
      profileImage: updatedUserDetail.profileImage || null,
      phoneNumber: updatedUserDetail.phoneNumber || null,
      isPremium: updatedUserDetail.isPremium,
      isOnboarded: updatedUserDetail.isOnboarded,
      city: updatedUserDetail.city || null,
      state: updatedUserDetail.state || null,
      country: updatedUserDetail.country || null,
    },
    subscription: populatedUser.subscription[0]
      ? {
          plan: populatedUser.subscription[0].plan
            ? {
                planName: populatedUser.subscription[0].plan.type.name,
                startDate: populatedUser.subscription[0].plan.startDate,
                endDate: populatedUser.subscription[0].plan.endDate,
                status: populatedUser.subscription[0].plan.status,
              }
            : null,
          individualSubscriptions:
            populatedUser.subscription[0].individualSubscriptions?.map(
              (sub) => ({
                contentType: sub.contentType,
                name: sub.contentId.title || sub.contentId.name || 'N/A',
                startDate: sub.startDate,
                endDate: sub.endDate,
                status: sub.status,
              })
            ) || [],
        }
      : null,
  };

  const response = new ApiResponse(
    200,
    'User details updated successfully',
    userProfile
  );
  return res.status(response.statusCode).json(response);
});

// 3. Update User Profile Image
export const updateProfileImage = asyncHandler(async (req, res) => {
  const userId = req.params.id; // User ID from route params
  const file = req.file; // Multer parses the uploaded file

  validateId(userId, 'User ID'); // Validate user ID

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileName = `${userId}_${Date.now()}${path.extname(file.originalname)}`; // Generate unique file name for S3
  const filePath = file.path; // Local path of the uploaded file

  // console.log('FileName: ', fileName);
  // console.log('FilePath: ', filePath);

  // Upload the file to S3
  const uploadResult = await uploadFileToAwsS3({
    fileName,
    filePath,
    folderName: awsFolderNames.profile_image,
  });

  if (!uploadResult) {
    throw new ApiError(500, 'Failed to update pupdateProfileImagerofile image');
  }

  // Fetch the User to get the userDetails reference
  const user = await User.findById(userId).select('userDetails');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get the reference to UserDetail (userDetails field in User document)
  const userDetailId = user.userDetails;

  // Update the UserDetail document with the new profile image
  const updatedUserDetail = await UserDetail.findByIdAndUpdate(
    userDetailId,
    { profileImage: uploadResult.url },
    { new: true, runValidators: true }
  );

  if (!updatedUserDetail) {
    throw new ApiError(404, 'UserDetail not found');
  }

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Return response with URL
  const response = new ApiResponse(200, 'Profile image updated successfully', {
    imageUrl: uploadResult.url,
  });
  res.status(response.statusCode).json(response);
});

// 4. Get User streak
export const getUserStreak = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Find or create streak document
  let userStreak = await Streak.findOne({ userId });

  if (!userStreak) {
    const response = new ApiResponse(200, 'No streak data found', {
      userId,
      streakCount: 0,
      dates: [],
      currentStreak: 0,
    });
    return res.status(response.statusCode).json(response);
  }

  // Update streak if needed and get current streak info
  const streakInfo = await userStreak.updateDailyStreak();

  const response = new ApiResponse(200, 'User streak fetched successfully', {
    userId: userStreak.userId,
    streakCount: streakInfo.streakCount,
    dates: userStreak.dates,
    currentStreak: streakInfo.currentStreak,
    lastUpdated: userStreak.lastUpdated,
  });

  return res.status(response.statusCode).json(response);
});

// 5. Get User AI Access
export const getUserAIAccess = asyncHandler(async (req, res) => {
  const { userId, product } = req.body; // 'cvRater' or 'interviewTaker'

  // Validate product type
  if (!product || !['cvRater', 'interviewTaker'].includes(product)) {
    throw new ApiError(400, 'Invalid or missing product type');
  }

  // Validate user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const defaultSetting = await DefaultSetting.findOne();
  if (!defaultSetting) {
    throw new ApiError(500, 'Default settings not found');
  }

  const today = new Date().toISOString().split('T')[0];

  // Find or create AI access record for today
  let aiAccess = await AIAccess.findOne({
    userId,
    date: today,
  });

  // If no AI access record found, create one
  if (!aiAccess) {
    aiAccess = await AIAccess.create({
      userId,
      date: today,
      productAccess: {
        cvRater: { accessCount: 0 },
        interviewTaker: { accessCount: 0 },
      },
    });
  }

  const canAccess = await aiAccess.canAccessAI(product);
  const productStats = aiAccess.productAccess[product];
  const maxAllowedAccess = defaultSetting.aiAccess[product].maxAllowedAccess;
  const remainingAccess = maxAllowedAccess - productStats.accessCount;

  const response = new ApiResponse(
    200,
    'AI access status fetched successfully',
    {
      canAccess,
      accessCount: productStats.accessCount,
      maxAllowedAccess,
      remainingAccess,
      date: today,
      product,
      isPremium: user.isPremium || false,
    }
  );

  return res.status(response.statusCode).json(response);
});

// 6. Update User AI Access
export const updateUserAIAccess = asyncHandler(async (req, res) => {
  const { userId, product } = req.body;

  // Validate product type
  if (!product || !['cvRater', 'interviewTaker'].includes(product)) {
    throw new ApiError(400, 'Invalid or missing product type');
  }

  // Validate user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const defaultSetting = await DefaultSetting.findOne();
  if (!defaultSetting) {
    throw new ApiError(500, 'Default settings not found');
  }

  const today = new Date().toISOString().split('T')[0];

  // Find or create AI access record for today
  let aiAccess = await AIAccess.findOne({
    userId,
    date: today,
  });

  // If no AI access record found, create one
  if (!aiAccess) {
    aiAccess = await AIAccess.create({
      userId,
      date: today,
      productAccess: {
        cvRater: { accessCount: 0 },
        interviewTaker: { accessCount: 0 },
      },
    });
  }

  if (!(await aiAccess.canAccessAI(product))) {
    throw new ApiError(403, `You have reached your daily limit for ${product}`);
  }

  // Increment access count for specific product
  await aiAccess.incrementAccess(product);

  const productStats = aiAccess.productAccess[product];
  const maxAllowedAccess = defaultSetting.aiAccess[product].maxAllowedAccess;
  const remainingAccess = maxAllowedAccess - productStats.accessCount;

  const response = new ApiResponse(200, 'AI access updated successfully', {
    canAccess: await aiAccess.canAccessAI(product),
    accessCount: productStats.accessCount,
    maxAllowedAccess,
    remainingAccess,
    date: today,
    product,
  });

  return res.status(response.statusCode).json(response);
});

// 7. get user wallet details
export const getUserWalletDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  validateId(userId, 'User ID');

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const wallet = await Wallet.findOne({ userId }).select(
    '-__v -createdAt -updatedAt'
  );
  if (!wallet) {
    throw new ApiError(404, 'Wallet not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, 'Wallet details fetched successfully', wallet));
});

// Ping all the invities on user model referrals array
export const pingAllInvities = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const referrals = user?.referralUsers || [];

  // console.log(referrals);

  for (const referral of referrals) {
    // console.log('Referral: ', referral);
    await sendNotification(
      referral,
      "Let's Start Mining!", // Title
      'Join the action now and start earning rewards. Tap to begin your mining journey!' // Body
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Referrals pinged successfully'));
});

export const deleteUserAccount = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Delete related UserDetail
  if (user.userDetails) {
    await UserDetail.findByIdAndDelete(user.userDetails);
  }

  // Delete related Subscriptions
  // if (user.subscription?.length) {
  //   await Subscription.deleteMany({ _id: { $in: user.subscription } });
  // }

  // Delete related Wallet
  if (user.wallet) {
    await Wallet.findByIdAndDelete(user.wallet);
  }

  // Remove user from referredBy and referralUsers lists
  await User.updateMany(
    { referralUsers: userId },
    { $pull: { referralUsers: userId } }
  );

  // Delete user account
  await user.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'User account and related data deleted successfully')
    );
});
