import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { Wallet } from '../models/wallet.model.js';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/ApiResponse.js';

const REFERRAL_BONUS = 100; // Bonus coins for successful referral

// Initialize wallet for user
export const initializeWallet = async (userId, session) => {
  // Create new wallet with 0 balance
  const wallet = await Wallet.create(
    [
      {
        userId,
        balance: 0,
      },
    ],
    { session }
  );

  // Update user with wallet reference
  const user = await User.findByIdAndUpdate(userId, { wallet: wallet[0]._id }, { session });

  console.log(user);
  

  return wallet[0];
};

// Handle user registration with referral
export const handleUserRegistration = async (userId, referralCode) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the user who is being referred (User Y)
      const newUser = await User.findById(userId);
      if (!newUser) {
        throw new ApiError(404, 'User not found');
      }

      // Check if user is already referred
      if (newUser.referredBy) {
        throw new ApiError(400, 'User is already referred by someone');
      }

      // Initialize wallet for new user if not exists
      if (!newUser.wallet) {
        await initializeWallet(userId, session);
      }

      // Find the referring user (User X) by referral code
      const referringUser = await User.findOne({ referralCode });
      if (!referringUser) {
        throw new ApiError(404, 'Invalid referral code');
      }

      // Prevent self-referral
      if (referringUser._id.toString() === userId) {
        throw new ApiError(400, 'Cannot refer yourself');
      }

      // Update the new user's referral information
      await User.findByIdAndUpdate(
        userId,
        { referredBy: referringUser._id },
        { session }
      );

      // Update referring user's referral count and list
      await User.findByIdAndUpdate(
        referringUser._id,
        {
          $inc: { referralCount: 1 },
          $push: { referralUsers: userId },
        },
        { session }
      );

      // Initialize wallet for referring user if not exists
      let referrerWallet = await Wallet.findOne({ userId: referringUser._id });
      if (!referrerWallet) {
        referrerWallet = await initializeWallet(referringUser._id, session);
      }

      // Add referral bonus to referring user's wallet
      await Wallet.findByIdAndUpdate(
        referrerWallet._id,
        {
          $inc: { balance: REFERRAL_BONUS },
        },
        { session }
      );
      

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }


// Get user's referral details
export const getReferralDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('referralCode referralCount referralUsers wallet')
    .populate('referredBy', 'email')
    .populate('wallet', 'balance')
    .lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get list of referred users
  const referredUsers = await User.find({ referredBy: userId })
    .select('email userDetails.fullname createdAt')
    .populate('userDetails', 'fullname')
    .lean();

  const response = new ApiResponse(
    200,
    'Referral details fetched successfully',
    {
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      walletBalance: user.wallet?.balance || 0,
      referredUsers: referredUsers.map((user) => ({
        email: user.email,
        fullname: user.userDetails?.fullname,
        joinedAt: user.createdAt,
      })),
    }
  );

  return res.status(response.statusCode).json(response);
});
