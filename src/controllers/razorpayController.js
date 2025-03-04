import Razorpay from 'razorpay';
import config from '../config/config.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { Subscription } from '../models/subscription.model.js';
import { SubscriptionPlan } from '../models/subplans.model.js';
import { Payment } from '../models/payment.model.js';
import crypto from 'crypto';
import { sendNotification } from '../services/fcmService.js';
import { getContentModel } from '../config/common.js';

const { keyId: RAZORPAY_KEY_ID, keySecret: RAZORPAY_KEY_SECRET } =
  config.razorpayConfig;

// initializing razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', userId } = req.body;

  // Basic validation
  if (!amount || !userId) {
    throw new ApiError(400, 'Amount, and userId are required');
  }

  // Validate user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const options = {
    amount: amount,
    currency,
    receipt: `receipt_${new Date().getTime()}`,
  };

  const order = await razorpay.orders.create(options);
  if (!order) {
    throw new ApiError(500, 'Failed to create order');
  }

  // console.log('Order: ', order);

  const response = new ApiResponse(200, 'Order created successfully', {
    order_id: order.id,
    razorpay_key: RAZORPAY_KEY_ID, // Added Razorpay Key ID to the response
  });

  return res.status(response.statusCode).json(response);
});

export const insertPayment = asyncHandler(async (req, res) => {
  // 1. Basic validation of required fields
  const {
    razorpay_details: {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    },
    payment_details: {
      amount,
      currency,
      userId,
      paymentType,
      contentId,
      contentType,
      planTypeId,
    },
    paymentStatus,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Razorpay details are required');
  }
  // Basic validation
  if (!amount || !userId || !paymentType) {
    throw new ApiError(400, 'Amount, userId, and paymentType are required');
  }

  // 2. Validate user existence
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (contentType && contentType === 'Quiz') {
    contentType = 'QuizModule';
  }

  // 3. Handle payment failure from client
  if (paymentStatus === 'failure') {
    const failedPayment = await Payment.create({
      userId,
      amount,
      currency,
      paymentType,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentStatus: 'failed',
      failureReason: 'Payment failed at client side',
      ...(paymentType === 'individual'
        ? { contentDetails: { contentId, contentType } }
        : {
            subscriptionDetails: {
              planTypeId,
              duration: 'inactive',
              status: 'inactive',
            },
          }),
    });

    return res.status(200).json(
      new ApiResponse(200, 'Payment failed!!', {
        payment: failedPayment,
      })
    );
  }

  // 4. Verify Razorpay signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    const failedPayment = await Payment.create({
      userId,
      amount,
      currency,
      paymentType,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentStatus: 'failed',
      failureReason: 'Invalid payment signature',
      ...(paymentType === 'individual'
        ? { contentDetails: { contentId, contentType } }
        : {
            subscriptionDetails: {
              planTypeId,
              duration: 'inactive',
              status: 'inactive',
            },
          }),
    });

    throw new ApiError(400, 'Invalid payment signature');
  }

  // try {
  let duration = '';

  // 5. Payment type specific validation
  if (paymentType === 'individual') {
    if (!contentId || !contentType) {
      throw new ApiError(
        400,
        'ContentId and contentType are required for individual purchases'
      );
    }
    const ContentModel = getContentModel(contentType);
    const content = await ContentModel.findById(contentId);
    if (!content) {
      throw new ApiError(404, `${contentType} not found`);
    }
  } else if (paymentType === 'subscription') {
    if (!planTypeId) {
      throw new ApiError(400, 'PlanType is required for subscription');
    }
    if (!(await SubscriptionPlan.findById(planTypeId))) {
      throw new ApiError(400, 'Invalid plan type');
    }

    // const activeSubscription = await Payment.findOne({
    //   userId,
    //   paymentType: 'subscription',
    //   'subscriptionDetails.status': 'active',
    // });

    // if (activeSubscription) {
    //   throw new ApiError(400, 'User already has an active subscription');
    // }
  } else {
    throw new ApiError(400, 'Invalid payment type');
  }

  // 6. Verify payment status with Razorpay
  const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

  if (razorpayPayment.status !== 'captured') {
    const failedPayment = await Payment.create({
      userId,
      amount,
      currency,
      paymentType,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentStatus: 'failed',
      failureReason: `Payment not captured. Status: ${razorpayPayment.status}`,
      ...(paymentType === 'individual'
        ? { contentDetails: { contentId, contentType } }
        : {
            subscriptionDetails: {
              planTypeId,
              duration: 'inactive',
              status: 'inactive',
            },
          }),
    });

    throw new ApiError(
      400,
      `Payment not captured. Status: ${razorpayPayment.status}`
    );
  }

  // If it's a subscription payment, validate the plan and duration
  if (paymentType === 'subscription') {
    const plan = await SubscriptionPlan.findById(planTypeId);
    if (!plan) {
      throw new ApiError(400, 'Invalid plan type');
    }

    // Verify the amount matches the plan price
    if (amount == plan.monthlyPrice) {
      duration = 'monthly';
    } else if (amount == plan.yearlyPrice) {
      duration = 'yearly';
    } else {
      throw new ApiError(400, 'Invalid payment amount for the selected plan');
    }
  }
  // 7. Create successful payment record and grant access
  const payment = await Payment.create({
    userId,
    amount,
    currency,
    paymentType,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentStatus: 'paid',
    ...(paymentType === 'individual'
      ? { contentDetails: { contentId, contentType } }
      : {
          subscriptionDetails: {
            planTypeId,
            duration,
            status: 'active',
          },
        }),
  });

  // Grant access based on payment type
  await grantContentAccess(payment);

  // 8. Send success notification
  /*if (paymentType === 'individual') {
      // sendNotification({
      //   userId,
      //   title: 'Purchase Successful! 🎉',
      //   body: `You now have access to the ${contentType}. Start learning now!`,
      //   data: {
      //     type: 'purchase_success',
      //     contentType,
      //     contentId: contentId.toString(),
      //     paymentId: payment._id.toString(),
      //   },
      // });
    } else {
      // sendNotification({
      //   userId,
      //   title: 'Subscription Activated! 🌟',
      //   body: `Your subscription is now active. Enjoy unlimited access to premium content!`,
      //   data: {
      //     type: 'subscription_activated',
      //     planTypeId,
      //     subscriptionId: subscription._id.toString(),
      //     paymentId: payment._id.toString(),
      //   },
      // });
    }*/

  const response = new ApiResponse(200, 'Payment verified successfully', {
    payment,
  });
  return res.status(response.statusCode).json(response);
  // } catch (err) {
  //   const { error } = err;
  //   console.log('Error: ', error);
  //   throw new ApiError(400, 'Payment verification failed');
  // }
});

// Helper function to grant content access and manage subscriptions
const grantContentAccess = asyncHandler(async (payment) => {
  const { userId, paymentType } = payment;

  // Find or create subscription document for user
  let subscription = await Subscription.findOne({ userId });
  if (!subscription) {
    subscription = await Subscription.create({
      userId,
    });
  }

  // Grant access based on payment type
  if (paymentType === 'individual') {
    const { contentId, contentType } = payment.contentDetails;
    if (!contentId || !contentType) {
      throw new ApiError(400, 'Content details are required');
    }

    // Calculate end date (assuming lifetime access for individual content)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100); // 100 years in the future

    // Add to individualSubscriptions array
    subscription.individualSubscriptions.push({
      contentType,
      contentId,
      startDate,
      endDate,
      status: 'active',
    });
  } else if (paymentType === 'subscription') {
    const { planTypeId, duration } = payment.subscriptionDetails;
    if (!planTypeId) {
      throw new ApiError(400, 'Plan type is required for subscription');
    }

    // Find the subscription plan
    const subscriptionPlan = await SubscriptionPlan.findById(planTypeId);
    if (!subscriptionPlan) {
      throw new ApiError(404, 'Subscription plan not found');
    }

    // Calculate dates based on duration
    const startDate = new Date();
    const endDate = new Date();
    if (duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (duration === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update plan details
    subscription.plan = {
      type: subscriptionPlan._id,
      startDate,
      endDate,
      status: 'active',
    };
  } else {
    throw new ApiError(400, 'Invalid payment type');
  }

  await subscription.save();

  // Update User model
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Add subscription reference if not already present
  if (!user.subscription.includes(subscription._id)) {
    user.subscription.push(subscription._id);
  }

  // Update isPremium flag if it's a plan subscription
  if (paymentType === 'subscription') {
    user.isPremium = true;
  }

  await user.save();

  return subscription;
});

// Get subscription plans
export const getSubscriptionPlans = asyncHandler(async (req, res) => {
  const subscriptionPlans = await SubscriptionPlan.find();
  return res.status(200).json(subscriptionPlans);
});
