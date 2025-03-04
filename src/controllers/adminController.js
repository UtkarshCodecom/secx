import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  sendNotification,
  sendNotificationToAllUsers,
} from '../services/fcmService.js';
import { Course } from '../models/course.model.js';
import { Pathway } from '../models/pathway.model.js';
import { Podcast } from '../models/podcast.model.js';
import { Event } from '../models/event.model.js';
import { QuizModule } from '../models/quiz.model.js';
import { User } from '../models/user.model.js';
import { UserDetail } from '../models/userdetail.model.js';
import { Subscription } from '../models/subscription.model.js';
import { PlanTypeSchema, SubscriptionPlan } from '../models/subplans.model.js';
import { Wallet } from '../models/wallet.model.js';
import { validateId } from '../utils/validateId.js';
import { Payment } from '../models/payment.model.js';
import { DefaultSetting } from '../models/defaultsetting.model.js';
import { ContentSchema, ContentType } from '../models/contenttypes.model.js';
import { Feedback } from '../models/feedback.model.js';
import { Admin } from '../models/admin.model.js';
import path from 'path';
import fs from 'fs';
import { uploadFileToAwsS3 } from '../config/s3Use.js';
import { awsFolderNames } from '../services/awsS3connect.js';

// 1. Get all courses
export const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().select(
    'title subtitle thumbnailUrl duration price isFree'
  );
  return res
    .status(200)
    .json(new ApiResponse(200, 'Courses fetched successfully', courses));
});

// 2. Get course by ID
export const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Course fetched successfully', course));
});

// 3. Get all pathways
export const getAllPathways = asyncHandler(async (req, res) => {
  const pathways = await Pathway.find().select(
    'title thumbnailUrl duration creator tags isFree price'
  );
  return res
    .status(200)
    .json(new ApiResponse(200, 'Pathways fetched successfully', pathways));
});

// 4. Get pathway by ID
export const getPathwayById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pathway = await Pathway.findById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Pathway fetched successfully', pathway));
});

// 5. Get all podcasts
export const getAllPodcasts = asyncHandler(async (req, res) => {
  const podcasts = await Podcast.find();
  return res
    .status(200)
    .json(new ApiResponse(200, 'Podcasts fetched successfully', podcasts));
});

// 6. Get podcast by ID
export const getPodcastById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const podcast = await Podcast.findById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Podcast fetched successfully', podcast));
});

// 7. Get all events
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().select(
    'title description venue totalSlots remainingSlots thumbnailUrl eventDate eventTime isFree price'
  );
  return res
    .status(200)
    .json(new ApiResponse(200, 'Events fetched successfully', events));
});

// 8. Get event by ID
export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Event fetched successfully', event));
});

// 9. Get all quizzes
export const getAllQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await QuizModule.find();
  return res
    .status(200)
    .json(new ApiResponse(200, 'Quizzes fetched successfully', quizzes));
});

// 10. Get quiz by ID
export const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await QuizModule.findById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Quiz fetched successfully', quiz));
});

// 11. Send FCM Notification
export const sendFCMNotification = asyncHandler(async (req, res) => {
  const { userId, title, body, data = {} } = req.body;

  // Validate input
  if (!userId || !title || !body) {
    throw new ApiError(400, 'userId, title, and body are required fields.');
  }

  // Call the utility function to send the notification
  const notificationSent = await sendNotification(userId, title, body, data);

  if (notificationSent) {
    return res
      .status(200)
      .json(new ApiResponse(200, 'Notification sent successfully'));
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          404,
          'No active FCM tokens found for the specified user.'
        )
      );
  }
});

// 12. Send FCM Notification to all users
export const sendFCMNotificationToAllUsers = asyncHandler(async (req, res) => {
  const { title, body, data = {}, premiumOnly } = req.body;
  const notificationSent = await sendNotificationToAllUsers(
    title,
    body,
    data,
    premiumOnly
  );
  if (notificationSent) {
    return res
      .status(200)
      .json(new ApiResponse(200, 'Notification sent successfully'));
  } else {
    return res.status(200).json(new ApiResponse(404, 'Notification not sent'));
  }
});

// 13. Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('_id isPremium userDetails')
    .populate(
      'userDetails',
      'fullname profileImage phoneNumber city state country'
    );

  const formattedUsers = users.map((user) => ({
    userId: user._id,
    profileImage:
      user.userDetails?.profileImage ||
      'https://avatar.iran.liara.run/public/boy?username=Ash',
    fullName: user.userDetails?.fullname || 'N/A',
    phoneNumber: user.userDetails?.phoneNumber || 'N/A',
    city: user.userDetails?.city || 'N/A',
    state: user.userDetails?.state || 'N/A',
    country: user.userDetails?.country || 'N/A',
    isPremium: user.isPremium || false,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, 'Users fetched successfully', formattedUsers));
});

// // Function to delete user
// export const deleteUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id); // Find user by ID from the token

//   if (user) {
//     await user.remove(); // Remove the user from the database
//     res.json({ message: 'User account deleted successfully' });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });

// 14. Get detailed user information by ID
export const getUserDetailById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate userId
  validateId(userId, 'User ID');

  // Fetch user with populated references
  const user = await User.findById(userId)
    .select('-password')
    .populate({
      path: 'userDetails',
      select:
        'fullname profileImage phoneNumber city state country isOnboarded',
    })
    .populate({
      path: 'subscription',
      populate: [
        {
          path: 'plan.type',
          model: 'PlanType',
          select:
            'name description monthlyPrice yearlyPrice isMonthly isYearly',
        },
        {
          path: 'individualSubscriptions.contentId',
          // refPath: "individualSubscriptions.contentType",
          select: 'title name description thumbnailUrl price duration',
        },
      ],
    })
    .populate({
      path: 'referralUsers',
      select: '_id userDetails',
      populate: {
        path: 'userDetails',
        select: 'fullname profileImage',
      },
    })
    .populate({
      path: 'referredBy',
      select: '_id userDetails',
      populate: {
        path: 'userDetails',
        select: 'fullname profileImage',
      },
    })
    .populate('wallet');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Format the response
  const formattedResponse = {
    // Basic User Details
    userInfo: {
      userId: user._id,
      email: user.email,
      provider: user.provider,
      profileDetails: {
        fullName: user.userDetails?.fullname || 'N/A',
        profileImage:
          user.userDetails?.profileImage ||
          'https://avatar.iran.liara.run/public/boy?username=Ash',
        phoneNumber: user.userDetails?.phoneNumber || 'N/A',
        city: user.userDetails?.city || 'N/A',
        state: user.userDetails?.state || 'N/A',
        country: user.userDetails?.country || 'N/A',
        isOnboarded: user.userDetails?.isOnboarded || false,
      },
    },

    // Premium & Subscription Details
    premiumDetails: {
      isPremium: user.isPremium || false,
      subscriptions:
        user.subscription?.map((sub) => ({
          planDetails: sub.plan
            ? {
                planType: sub.plan.type?.name || 'N/A',
                description: sub.plan.type?.description || 'N/A',
                monthlyPrice: sub.plan.type?.monthlyPrice || 0,
                yearlyPrice: sub.plan.type?.yearlyPrice || 0,
                isMonthly: sub.plan.type?.isMonthly || false,
                isYearly: sub.plan.type?.isYearly || false,
                startDate: sub.plan.startDate,
                endDate: sub.plan.endDate,
                status: sub.plan.status,
              }
            : null,
          individualSubscriptions:
            sub.individualSubscriptions?.map((content) => ({
              contentType: content.contentType,
              content: {
                id: content.contentId?._id,
                title:
                  content.contentId?.title || content.contentId?.name || 'N/A',
                description: content.contentId?.description || 'N/A',
                thumbnailUrl: content.contentId?.thumbnailUrl,
                price: content.contentId?.price,
                duration: content.contentId?.duration,
                creator: content.contentId?.creator,
                tags: content.contentId?.tags,
              },
              startDate: content.startDate,
              endDate: content.endDate,
              status: content.status,
            })) || [],
        })) || [],
    },

    // Referral Details
    referralDetails: {
      referralCode: user.referralCode,
      totalReferrals: user.referralCount,
      referredBy: user.referredBy
        ? {
            userId: user.referredBy._id,
            fullName: user.referredBy.userDetails?.fullname || 'N/A',
            profileImage:
              user.referredBy.userDetails?.profileImage ||
              'https://avatar.iran.liara.run/public/boy?username=Ash',
          }
        : null,
      referredUsers:
        user.referralUsers?.map((referredUser) => ({
          userId: referredUser._id,
          fullName: referredUser.userDetails?.fullname || 'N/A',
          profileImage:
            referredUser.userDetails?.profileImage ||
            'https://avatar.iran.liara.run/public/boy?username=Ash',
        })) || [],
    },

    // Wallet Details
    walletInfo: {
      balance: user.wallet?.balance || 0,
      walletId: user.wallet?._id,
    },
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'User details fetched successfully',
        formattedResponse
      )
    );
});

// 15. Get all payments with formatted response
export const getPaymentTransactions = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate({
      path: 'userId',
      select: '_id userDetails',
      populate: {
        path: 'userDetails',
        select: 'fullname profileImage',
      },
    })
    .populate({
      path: 'subscriptionDetails.planTypeId',
      select: 'name description monthlyPrice yearlyPrice',
    })
    .sort({ createdAt: -1 }); // Sort by latest first
  
  // Filter out payments where userId is null
  const validPayments = payments.filter((payment) => payment.userId);

  const formattedPayments = validPayments.map((payment) => ({
    paymentId: payment._id,
    userDetails: {
      userId: payment.userId?._id || 'N/A',
      fullName: payment.userId?.userDetails?.fullname || 'N/A',
      profileImage: payment.userId?.userDetails?.profileImage || '',
    },
    paymentStatus: payment.paymentStatus,
    amount: payment.amount,
    razorpay_payment_id: payment.razorpay_payment_id,
    paymentType: payment.paymentType,
    subscriptionDetails:
      payment.paymentType === 'subscription'
        ? {
            planName: payment.subscriptionDetails.planTypeId?.name || 'N/A',
            duration: payment.subscriptionDetails.duration,
            status: payment.subscriptionDetails.status,
          }
        : {
            contentType: payment.contentDetails?.contentType,
          },
    createdAt: payment.createdAt,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Payments fetched successfully', formattedPayments)
    );
});

// 16. Get detailed payment history by payment ID
export const getPaymentDetailsById = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  validateId(paymentId, 'Payment ID');

  const payment = await Payment.findById(paymentId)
    .populate({
      path: 'userId',
      select: '-password',
      populate: {
        path: 'userDetails',
        select: 'fullname profileImage phoneNumber city state country',
      },
    })
    .populate({
      path: 'subscriptionDetails.planTypeId',
      select: 'name description monthlyPrice yearlyPrice isMonthly isYearly',
    });

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  // Dynamically populate `contentId` based on `contentType`
  if (payment && payment.contentDetails && payment.contentDetails.contentType) {
    const contentModel = payment.contentDetails.contentType; // e.g., 'Course', 'Quiz', 'Pathway'
    await payment.populate({
      path: 'contentDetails.contentId',
      model: contentModel, // Dynamically use the model from `contentType`
      select: 'title description thumbnailUrl price duration', // Adjust fields as needed
    });
  }

  const formattedPaymentDetails = {
    paymentInfo: {
      paymentId: payment._id,
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_signature: payment.razorpay_signature,
      amount: payment.amount,
      currency: payment.currency,
      paymentStatus: payment.paymentStatus,
      paymentType: payment.paymentType,
      failureReason: payment.failureReason || null,
      createdAt: payment.createdAt,
    },
    userDetails: {
      userId: payment.userId._id,
      email: payment.userId.email,
      fullName: payment.userId.userDetails?.fullname || 'N/A',
      profileImage:
        payment.userId.userDetails?.profileImage ||
        'https://avatar.iran.liara.run/public/boy?username=Ash',
      phoneNumber: payment.userId.userDetails?.phoneNumber || 'N/A',
      city: payment.userId.userDetails?.city || 'N/A',
      state: payment.userId.userDetails?.state || 'N/A',
      country: payment.userId.userDetails?.country || 'N/A',
    },
    purchaseDetails:
      payment.paymentType === 'subscription'
        ? {
            planDetails: {
              planName: payment.subscriptionDetails.planTypeId?.name || 'N/A',
              description:
                payment.subscriptionDetails.planTypeId?.description || 'N/A',
              monthlyPrice:
                payment.subscriptionDetails.planTypeId?.monthlyPrice || 0,
              yearlyPrice:
                payment.subscriptionDetails.planTypeId?.yearlyPrice || 0,
              duration: payment.subscriptionDetails.duration,
              status: payment.subscriptionDetails.status,
            },
          }
        : {
            contentDetails: {
              contentType: payment.contentDetails?.contentType,
              content: {
                id: payment.contentDetails?.contentId?._id,
                title: payment.contentDetails?.contentId?.title || 'N/A',
                description:
                  payment.contentDetails?.contentId?.description || 'N/A',
                thumbnailUrl: payment.contentDetails?.contentId?.thumbnailUrl,
                price: payment.contentDetails?.contentId?.price || 0,
                duration: payment.contentDetails?.contentId?.duration,
              },
            },
          },
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Payment details fetched successfully',
        formattedPaymentDetails
      )
    );
});

// 17. Get Default Setting
export const getDefaultSetting = asyncHandler(async (req, res) => {
  const defaultSetting = await DefaultSetting.findOne();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Default setting fetched successfully',
        defaultSetting
      )
    );
});

// 18. Update Default Setting
export const updateDefaultSetting = asyncHandler(async (req, res) => {
  const { defaultSetting } = req.body;

  const updatedSetting = await DefaultSetting.findOneAndUpdate(
    {},
    defaultSetting,
    { new: true, upsert: true } // Use `upsert: true` to create the document if none exists.
  ).select('-__v -updatedAt -createdAt');

  if (!updatedSetting) {
    throw new ApiError(404, 'Default setting not found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Default setting updated successfully',
        updatedSetting
      )
    );
});

// 19. Get admin dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // 1. Get user statistics
    const [totalUsers, premiumUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPremium: true }),
    ]);

    // 2. Get content statistics
    const [courses, quizzes, events, pathways, podcasts] = await Promise.all([
      Course.countDocuments(),
      QuizModule.countDocuments(),
      Event.countDocuments(),
      Pathway.countDocuments(),
      Podcast.countDocuments(),
    ]);

    // 3. Get payment statistics
    const paymentStats = await Payment.aggregate([
      {
        $match: { paymentStatus: 'paid' },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    // 4. Get most selling content (top 5)
    const mostSellingContent = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          'contentDetails.contentId': { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            contentId: '$contentDetails.contentId',
            contentType: '$contentDetails.contentType',
          },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
        },
      },
      {
        $sort: { totalSales: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Get content details for each top selling item
    const topContentWithDetails = await Promise.all(
      mostSellingContent.map(async (item) => {
        let contentDetails;
        const contentType = item._id.contentType;
        const contentId = item._id.contentId;

        // Get the appropriate model based on content type
        const ModelMap = {
          Course,
          Pathway,
          QuizModule,
          Event,
          Podcast,
        };

        const ContentModel = ModelMap[contentType];
        if (ContentModel) {
          if (contentType === 'QuizModule') {
            // Special handling for QuizModule
            contentDetails = await ContentModel.findById(contentId).select(
              'name imageUrl'
            );
          } else {
            contentDetails = await ContentModel.findById(contentId).select(
              'title description thumbnailUrl'
            );
          }
        }

        return {
          contentType,
          title:
            contentType === 'QuizModule'
              ? contentDetails?.name || 'Unknown'
              : contentDetails?.title || 'Unknown',
          description:
            contentType === 'QuizModule'
              ? ''
              : contentDetails?.description || 'No description',
          thumbnailUrl:
            contentType === 'QuizModule'
              ? contentDetails?.imageUrl
              : contentDetails?.thumbnailUrl,
          totalSales: item.totalSales,
          revenue: item.totalRevenue,
        };
      })
    );

    // 5. Get recent transactions
    const paymentTransactions = await Payment.find({
      paymentStatus: 'paid',
      userId: { $ne: null }, // Exclude payments where userId is null
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'email')
      .select('amount paymentType createdAt');

    const recentTransactions = paymentTransactions.filter((tx) => tx.userId); // Remove null userId

    // 6. Get user registration trends (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // 7. Get subscription plan statistics
    // const subscriptionStats = await Subscription.aggregate([
    //   {
    //     $group: {
    //       _id: '$plan.type',
    //       totalSubscribers: { $sum: 1 },
    //     },
    //   },
    // ]);

    // const subscriptionStats = await Subscription.aggregate([
    //   {
    //     $match: {
    //       'plan.type': { $exists: true },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'planTypes', // Collection name for SubscriptionPlan model
    //       localField: 'plan.type',
    //       foreignField: '_id',
    //       as: 'planDetails',
    //     },
    //   },
    //   {
    //     $unwind: '$planDetails',
    //   },
    //   {
    //     $group: {
    //       _id: '$plan.type',
    //       planName: { $first: '$planDetails.name' },
    //       description: { $first: '$planDetails.description' },
    //       monthlyPrice: { $first: '$planDetails.monthlyPrice' },
    //       yearlyPrice: { $first: '$planDetails.yearlyPrice' },
    //       totalSubscribers: { $sum: 1 },
    //     },
    //   },
    // ]);

    const subscriptionStats = await Subscription.aggregate([
      {
        $lookup: {
          from: 'plantypes', // Collection name for SubscriptionPlan
          localField: 'plan.type',
          foreignField: '_id',
          as: 'planDetails',
        },
      },
      {
        $unwind: '$planDetails', // Flatten the array returned by $lookup
      },
      {
        $group: {
          _id: '$plan.type', // Group by plan type
          planName: { $first: '$planDetails.name' },
          description: { $first: '$planDetails.description' },
          monthlyPrice: { $first: '$planDetails.monthlyPrice' },
          yearlyPrice: { $first: '$planDetails.yearlyPrice' },
          totalSubscribers: { $sum: 1 }, // Count total subscribers for each plan
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the result
          planName: 1,
          description: 1,
          monthlyPrice: 1,
          yearlyPrice: 1,
          totalSubscribers: 1,
        },
      },
    ]);

    const dashboardData = {
      userStats: {
        totalUsers,
        premiumUsers,
        conversionRate: ((premiumUsers / totalUsers) * 100).toFixed(2) + '%',
      },
      contentStats: {
        totalCourses: courses,
        totalQuizzes: quizzes,
        totalEvents: events,
        totalPathways: pathways,
        totalPodcasts: podcasts,
        totalContent: courses + quizzes + events + pathways + podcasts,
      },
      financialStats: {
        totalRevenue: paymentStats[0]?.totalAmount || 0,
        totalTransactions: paymentStats[0]?.totalTransactions || 0,
        averageTransactionValue: paymentStats[0]
          ? (
              paymentStats[0].totalAmount / paymentStats[0].totalTransactions
            ).toFixed(2)
          : 0,
      },
      topContent: topContentWithDetails,
      recentTransactions: recentTransactions.map((tx) => ({
        amount: tx.amount,
        type: tx.paymentType,
        userEmail: tx.userId.email,
        // userEmail: tx.userId ? tx.userId.email : 'N/A',
        date: tx.createdAt,
      })),
      userTrends: userTrends,
      subscriptionStats: subscriptionStats.map((stat) => ({
        planName: stat.planName, // Name of the plan
        description: stat.description, // Description of the plan
        // monthlyPrice: stat.monthlyPrice, // Monthly price
        // yearlyPrice: stat.yearlyPrice, // Yearly price
        totalSubscribers: stat.totalSubscribers, // Total subscribers for the plan
      })),
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'Dashboard statistics fetched successfully',
          dashboardData
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Error fetching dashboard statistics: ${error.message}`
    );
  }
});

// 20. Get all content types
export const getAllContentTypes = asyncHandler(async (req, res) => {
  const contentTypes = await ContentType.find({}).select(
    '-__v -updatedAt -createdAt'
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Content types fetched successfully', contentTypes)
    );
});

// 21. Get all subscription plans
export const getAllSubscriptionPlans = asyncHandler(async (req, res) => {
  const subscriptionPlans = await SubscriptionPlan.find({});
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Subscription plans fetched successfully',
        subscriptionPlans
      )
    );
});

// 22. Get individual subscription plan
export const getIndividualSubscriptionPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscriptionPlan = await SubscriptionPlan.findById(id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Subscription plan fetched successfully',
        subscriptionPlan
      )
    );
});

// 23. Create or update subscription plan
export const upsertSubscriptionPlan = asyncHandler(async (req, res) => {
  const { id } = req.params; // For update, the ID will be passed as a parameter
  const {
    name,
    allowedContent,
    description,
    monthlyPrice,
    yearlyPrice,
    isMonthly,
    isYearly,
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Plan name is required' });
  }

  const payload = {
    name,
    allowedContent,
    description: description || '',
    monthlyPrice: monthlyPrice || 0,
    yearlyPrice: yearlyPrice || 0,
    isMonthly: !!isMonthly,
    isYearly: !!isYearly,
  };

  let subscriptionPlan;

  const isValidPlanName = PlanTypeSchema.path('name').enumValues.includes(name);

  if (!isValidPlanName) {
    return res.status(400).json({ message: 'Plan name not valid' });
  }

  if (id) {
    // Update an existing subscription plan
    subscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
  } else {
    // Create a new subscription plan
    subscriptionPlan = new SubscriptionPlan(payload);
    await subscriptionPlan.save();
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Subscription plan created successfully',
        subscriptionPlan
      )
    );
});

// 24. Get all feedbacks
export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({})
    .populate({
      path: 'userId',
      select: 'email userDetails', // Fetch email and userDetails
      populate: {
        path: 'userDetails',
        select: 'fullname profileImage', // Fetch fullname and profileImage from UserDetail
      },
    })
    .lean(); // lean() is used to return plain JavaScript objects instead of Mongoose documents

  const formattedFeedbacks = feedbacks.map((feedback) => ({
    _id: feedback._id,
    email: feedback.userId?.email || 'N/A',
    fullname: feedback.userId?.userDetails?.fullname || 'N/A',
    profileImage:
      feedback.userId?.userDetails?.profileImage ||
      'https://avatar.iran.liara.run/public/boy?username=Ash', // Default profile image if not available
    description: feedback.description,
    date: feedback.createdAt,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Feedbacks fetched successfully', formattedFeedbacks)
    );
});

// 25. Grant subscription or content access to user
export const giveAwayUser = asyncHandler(async (req, res) => {
  const { userId, accessType, contentId, duration } = req.body;

  // Validate inputs
  if (!userId || !accessType || !duration) {
    throw new ApiError(400, 'userId, accessType and duration are required');
  }

  // Validate accessType
  if (!['plan', 'individual'].includes(accessType)) {
    throw new ApiError(400, 'accessType must be either "plan" or "individual"');
  }

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subscription;
    let notificationTitle;
    let notificationBody;
    let contentName = '';

    if (accessType === 'plan') {
      // Validate plan exists
      const plan = await SubscriptionPlan.findById(contentId);
      if (!plan) {
        throw new ApiError(404, 'Subscription plan not found');
      }

      contentName = plan.name;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(duration)); // for duration days

      // Check if user already has an active subscription
      const existingSubscription = await Subscription.findOne({
        userId,
        'plan.status': 'active',
      });

      if (existingSubscription) {
        // Update existing subscription
        subscription = await Subscription.findByIdAndUpdate(
          existingSubscription._id,
          {
            $set: {
              'plan.type': contentId,
              'plan.startDate': new Date(),
              'plan.endDate': endDate,
              'plan.status': 'active',
              grantedByAdmin: true,
            },
          },
          { new: true, session }
        );
      } else {
        // Create new subscription
        subscription = await Subscription.create(
          [
            {
              userId,
              plan: {
                type: contentId,
                startDate: new Date(),
                endDate,
                status: 'active',
              },
              individualSubscriptions: [],
              grantedByAdmin: true,
            },
          ],
          { session }
        );

        subscription = subscription[0]; // Get the created document from array
      }

      // Update user's premium status and subscription in a single operation
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { subscription: subscription._id }, // Prevent duplicates in the array
          isPremium: true, // Update the premium status
        },
        { session } // Use the session for transaction consistency
      );
    } else {
      // For individual content access
      const ModelMap = {
        Course,
        Pathway,
        QuizModule,
        Event,
        Podcast,
      };

      const contentType = req.body.contentType;
      if (!contentType || !ModelMap[contentType]) {
        throw new ApiError(
          400,
          'Valid contentType is required for individual access'
        );
      }

      const ContentModel = ModelMap[contentType];
      const content = await ContentModel.findById(contentId);
      if (!content) {
        throw new ApiError(404, 'Content not found');
      }

      contentName = content.title || content.name;
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 100); // for lifetime access

      // Check if user already has a subscription document
      let existingSubscription = await Subscription.findOne({ userId });

      if (existingSubscription) {
        // Check if content is already in individualSubscriptions
        const existingContent =
          existingSubscription.individualSubscriptions.find(
            (sub) =>
              sub.contentId.toString() === contentId && sub.status === 'active'
          );

        if (existingContent) {
          // Update existing content subscription
          subscription = await Subscription.findOneAndUpdate(
            {
              userId,
              'individualSubscriptions.contentId': contentId,
            },
            {
              $set: {
                'individualSubscriptions.$.startDate': new Date(),
                'individualSubscriptions.$.endDate': endDate,
                'individualSubscriptions.$.status': 'active',
                grantedByAdmin: true,
              },
            },
            { new: true, session }
          );
        } else {
          // Add new content to existing subscription
          subscription = await Subscription.findByIdAndUpdate(
            existingSubscription._id,
            {
              $push: {
                individualSubscriptions: {
                  contentId,
                  contentType,
                  startDate: new Date(),
                  endDate,
                  status: 'active',
                },
              },
              $set: { grantedByAdmin: true },
            },
            { new: true, session }
          );
        }
      } else {
        // Create new subscription with individual content
        subscription = await Subscription.create(
          [
            {
              userId,
              individualSubscriptions: [
                {
                  contentId,
                  contentType,
                  startDate: new Date(),
                  endDate,
                  status: 'active',
                },
              ],
              grantedByAdmin: true,
            },
          ],
          { session }
        );

        subscription = subscription[0];
      }
    }

    await session.commitTransaction();

    // Prepare notification content based on access type
    if (accessType === 'plan') {
      notificationTitle = '🎉 Congratulations! Premium Plan Activated';
      notificationBody = `You've been granted access to ${contentName} plan for ${duration} days. Enjoy premium features!`;
    } else {
      notificationTitle = '🎁 New Content Access Granted';
      notificationBody = `You've been given lifetime access to ${contentName}. Start learning now!`;
    }

    // Send notification to user
    const notificationData = {
      type: 'giveaway',
      accessType,
      contentId,
      grantedAt: new Date().toISOString(),
    };

    // Send notification asynchronously
    sendNotification(
      userId,
      notificationTitle,
      notificationBody,
      notificationData
    )
      .then((sent) => {
        if (sent) {
          console.log(`Notification sent successfully to user ${userId}`);
        } else {
          console.log(`Failed to send notification to user ${userId}`);
        }
      })
      .catch((error) => {
        console.error('Error sending notification:', error);
      });

    return res.status(200).json(
      new ApiResponse(200, 'Access granted successfully', {
        subscription,
        message: `${
          accessType === 'plan' ? 'Plan' : 'Content'
        } access granted for ${duration} days`,
        notificationSent: true,
      })
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// export const giveAwayUser = asyncHandler(async (req, res) => {
//   const { userId, accessType, contentId, duration } = req.body;

//   // Validate inputs
//   if (!userId || !accessType || !duration) {
//     throw new ApiError(400, 'userId, accessType and duration are required');
//   }

//   // Validate accessType
//   if (!['plan', 'individual'].includes(accessType)) {
//     throw new ApiError(400, 'accessType must be either "plan" or "individual"');
//   }

//   // Validate user exists
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new ApiError(404, 'User not found');
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     let subscription = await Subscription.findOne({ userId });
//     let notificationTitle;
//     let notificationBody;
//     let contentName = '';

//     // Find or create subscription document for user
//     if (!subscription) {
//       subscription = await Subscription.create([{ userId }], { session });
//       subscription = subscription[0];
//     }

//     // Calculate dates based on duration
//     const startDate = new Date();
//     const endDate = new Date();
//     endDate.setDate(endDate.getDate() + parseInt(duration));

//     if (accessType === 'plan') {
//       // Validate plan exists
//       const plan = await SubscriptionPlan.findById(contentId);
//       if (!plan) {
//         throw new ApiError(404, 'Subscription plan not found');
//       }
//       contentName = plan.name;

//       // Check if user has an active plan
//       if (
//         subscription.plan?.status === 'active' &&
//         subscription.plan?.type.equals(contentId)
//       ) {
//         // Extend existing plan
//         const currentEndDate = new Date(subscription.plan.endDate);
//         const newEndDate = new Date(
//           currentEndDate.setDate(currentEndDate.getDate() + parseInt(duration))
//         );

//         subscription.plan.endDate = newEndDate;
//         notificationTitle = '🎉 Plan Extended!';
//         notificationBody = `Your ${contentName} plan has been extended by ${duration} days!`;
//       } else {
//         // Set new plan
//         subscription.plan = {
//           type: contentId,
//           startDate,
//           endDate,
//           status: 'active',
//         };
//         notificationTitle = '🎉 New Plan Activated!';
//         notificationBody = `You've been granted access to ${contentName} plan for ${duration} days!`;
//       }

//       subscription.grantedByAdmin = true;
//       await subscription.save({ session });

//       // Update user's premium status
//       await User.findByIdAndUpdate(
//         userId,
//         {
//           isPremium: true,
//           $addToSet: { subscription: subscription._id },
//         },
//         { session }
//       );
//     } else {
//       // For individual content access
//       const ModelMap = {
//         Course,
//         Pathway,
//         Quiz: QuizModule,
//         Event,
//         Podcast,
//       };

//       const contentType = req.body.contentType;
//       if (!contentType || !ModelMap[contentType]) {
//         throw new ApiError(
//           400,
//           'Valid contentType is required for individual access'
//         );
//       }

//       const ContentModel = ModelMap[contentType];
//       const content = await ContentModel.findById(contentId);
//       if (!content) {
//         throw new ApiError(404, 'Content not found');
//       }
//       contentName = content.title;

//       // Check if content already exists in subscription
//       const existingContent = subscription.individualSubscriptions.find(
//         (sub) => sub.contentId.equals(contentId) && sub.status === 'active'
//       );

//       if (existingContent) {
//         // Extend existing content access
//         existingContent.endDate = endDate;
//         notificationTitle = '🎁 Access Extended!';
//         notificationBody = `Your access to ${contentName} has been extended by ${duration} days!`;
//       } else {
//         // Add new content access
//         subscription.individualSubscriptions.push({
//           contentId,
//           contentType,
//           startDate,
//           endDate,
//           status: 'active',
//         });
//         notificationTitle = '🎁 New Content Access!';
//         notificationBody = `You've been given access to ${contentName} for ${duration} days!`;
//       }

//       subscription.grantedByAdmin = true;
//       await subscription.save({ session });

//       // Ensure subscription is linked to user
//       await User.findByIdAndUpdate(
//         userId,
//         { $addToSet: { subscription: subscription._id } },
//         { session }
//       );
//     }

//     await session.commitTransaction();

//     // Send notification to user
//     const notificationData = {
//       type: 'giveaway',
//       accessType,
//       contentId,
//       grantedAt: new Date().toISOString(),
//     };

//     // Send notification asynchronously
//     sendNotification(
//       userId,
//       notificationTitle,
//       notificationBody,
//       notificationData
//     )
//       .then((sent) => {
//         if (sent) {
//           console.log(`Notification sent successfully to user ${userId}`);
//         } else {
//           console.log(`Failed to send notification to user ${userId}`);
//         }
//       })
//       .catch((error) => {
//         console.error('Error sending notification:', error);
//       });

//     return res.status(200).json(
//       new ApiResponse(200, 'Access granted successfully', {
//         subscription,
//         message: `${
//           accessType === 'plan' ? 'Plan' : 'Content'
//         } access granted for ${duration} days`,
//         notificationSent: true,
//       })
//     );
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     session.endSession();
//   }
// });

// Get content titles by type
export const getContentTitles = asyncHandler(async (req, res) => {
  const { contentType } = req.params;

  // Validate content type
  const ModelMap = {
    Course,
    Pathway,
    QuizModule,
    Event,
    Podcast,
  };

  if (!contentType || !ModelMap[contentType]) {
    throw new ApiError(
      400,
      'Invalid content type. Must be one of: Course, Pathway, Quiz, Event, Podcast'
    );
  }

  const ContentModel = ModelMap[contentType];

  // Get titles and IDs based on content type
  const contents = await ContentModel.find({})
    .select('_id title name') // Some models use 'name' instead of 'title'
    .lean();

  // Format the response
  const formattedContents = contents.map((content) => ({
    _id: content._id,
    title: content.title || content.name || 'Untitled', // Fallback for different field names
  }));

  return res.status(200).json(
    new ApiResponse(200, `${contentType} titles fetched successfully`, {
      contentType,
      count: formattedContents.length,
      contents: formattedContents,
    })
  );
});

// 27. Get all content types
export const getContentTypes = asyncHandler(async (req, res) => {
  const contentTypes = await ContentType.find({});
  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Content types fetched successfully', contentTypes)
    );
});

// 28. Get all users with admin-granted access
export const getGrantedUsers = asyncHandler(async (req, res) => {
  const grantedSubscriptions = await Subscription.find({ grantedByAdmin: true })
    .populate({
      path: 'userId',
      select: '_id userDetails',
      populate: {
        path: 'userDetails',
        select: 'fullname profileImage',
      },
    })
    .populate({
      path: 'plan.type',
      select: 'name description',
    })
    .lean();

  const formattedUsers = grantedSubscriptions.map((subscription) => {
    const user = subscription.userId;

    return {
      userId: user._id,
      fullName: user.userDetails?.fullname || 'N/A',
      profileImage:
        user.userDetails?.profileImage ||
        'https://avatar.iran.liara.run/public/boy?username=Ash',
      grantedAccess: {
        // Plan access details
        plan: subscription.plan
          ? {
              planId: subscription.plan.type?._id,
              planName: subscription.plan.type?.name || 'N/A',
              startDate: subscription.plan.startDate,
              endDate: subscription.plan.endDate,
              status: subscription.plan.status,
            }
          : null,
        // Individual content access details
        individualContent: subscription.individualSubscriptions.map((item) => ({
          contentId: item.contentId,
          contentType: item.contentType,
          startDate: item.startDate,
          endDate: item.endDate,
          status: item.status,
        })),
        grantedAt: subscription.createdAt,
      },
    };
  });

  // Sort by most recent grants first
  formattedUsers.sort(
    (a, b) =>
      new Date(b.grantedAccess.grantedAt) - new Date(a.grantedAccess.grantedAt)
  );

  return res.status(200).json(
    new ApiResponse(200, 'Granted users fetched successfully', {
      count: formattedUsers.length,
      users: formattedUsers,
    })
  );
});

// 29. Update Admin Profile
export const updateAdminProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user.id; // User ID from route params
  const file = req.file; // Multer parses the uploaded file

  validateId(userId, 'User ID'); // Validate user ID

  if (!file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const fileName = `${userId}_${Date.now()}${path.extname(file.originalname)}`; // Generate unique file name for S3
  const filePath = file.path; // Local path of the uploaded file

  // Upload the file to S3
  const uploadResult = await uploadFileToAwsS3({
    fileName,
    filePath,
    folderName: awsFolderNames.profile_image,
  });

  if (!uploadResult) {
    throw new ApiError(500, 'Failed to update pupdateProfileImagerofile image');
  }
  // Update the user's profile image in the database
  const user = await Admin.updateOne(
    { _id: userId },
    { profileImage: uploadResult.url }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Return response with URL
  const response = new ApiResponse(200, 'Profile image updated successfully', {
    imageUrl: uploadResult.url,
  });
  res.status(response.statusCode).json(response);
});

// 30. Update Admin Profile
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const { name, email, phone } = req.body;

  if (!name || !email) {
    throw new ApiError(400, 'Name and email are required.');
  }

  // Find and update admin profile
  const updatedAdmin = await Admin.findByIdAndUpdate(
    id,
    { name, email, phone },
    { new: true, runValidators: true } // Return updated document and run validations
  ).select('name email phone profileImage');

  if (!updatedAdmin) {
    throw new ApiError(404, 'Admin not found.');
  }

  const response = new ApiResponse(200, 'Profile updated successfully.', {
    admin: updatedAdmin,
  });
  res.status(response.statusCode).json(response);
});
