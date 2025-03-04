import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../services/authService.js';
import { sendMail } from '../services/mailService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { UserDetail } from '../models/userdetail.model.js';
import {
  OTP_ACTION,
  generateOTP,
  generateUsername,
  getRandomProfileImage,
} from '../config/common.js';
import { Admin } from '../models/admin.model.js';

// Function to log in a user
export const login = asyncHandler(async (req, res) => {
  const { email, password, provider } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  if (!provider) {
    throw new ApiError(400, 'Provider is required');
  }

  // Find user by email
  const user = await User.findOne({ email })
    .select('+password') // Include password explicitly if excluded in schema
    .populate({
      path: 'userDetails', // Populate the userDetails model
      select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
    })
    .populate({
      path: 'subscription',
      populate: [
        {
          path: 'plan', // Populate the SubscriptionPlan details
          select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
        },
        {
          path: 'individualSubscriptions', // Populate contentId in individualSubscriptions
          select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
        },
      ],
    });

  // Check if user exists
  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  // Check if provider matches
  if (user.provider !== provider) {
    throw new ApiError(401, `Please login with your ${user.provider} account`);
  }

  // Check password match
  if (await user.comparePassword(password)) {
    // Generate JWT token
    const token = generateToken({ id: user._id, email: user.email });

    // Respond with success
    const response = new ApiResponse(200, 'User logged in successfully', {
      userId: user._id,
      email: user.email,
      isPremium: user.isPremium,
      referralCode: Date.now(),
      userDetails: user.userDetails, // Include full userDetails model
      subscription: user.subscription
        ? {
            plan: user.subscription.plan
              ? {
                  type: user.subscription.plan.type,
                  startDate: user.subscription.plan.startDate,
                  endDate: user.subscription.plan.endDate,
                  status: user.subscription.plan.status,
                }
              : null,
            individualSubscriptions:
              user.subscription.individualSubscriptions?.map((sub) => ({
                contentType: sub.contentType,
                contentId: sub.contentId, // Content ID or populated content details
                status: sub.status,
                startDate: sub.startDate,
                endDate: sub.endDate,
              })) || [],
          }
        : null,
      token,
    });
    return res.status(response.statusCode).json(response);
  } else {
    // Throw error for invalid credentials
    throw new ApiError(401, 'Invalid email or password');
  }
});

// Function to register a new user
export const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    provider,
    fullname = generateUsername(),
    profileImage = getRandomProfileImage(),
    phoneNumber,
    isOnboarded = false,
    city,
    state,
    country,
    isPremium = false,
  } = req.body;

  // Validate required fields
  if (!email || !password || !provider) {
    throw new ApiError(400, 'Email, password, and provider are required');
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  // Start a transaction to ensure both User and UserDetail are created atomically
  const session = await mongoose.startSession();
  session.startTransaction();

  // Create UserDetail
  const userDetail = await UserDetail.create(
    [
      {
        fullname: fullname || generateUsername(),
        profileImage: profileImage || getRandomProfileImage(),
        isOnboarded,
        phoneNumber: phoneNumber || '',
        city: city || '',
        state: state || '',
        country: country || '',
      },
    ],
    { session }
  );

  // Create User
  const user = await User.create(
    [
      {
        email,
        password,
        provider,
        isPremium,
        userDetails: userDetail[0]._id, // Link UserDetail to User
      },
    ],
    { session }
  );

  // Commit the transaction
  await session.commitTransaction();
  session.endSession();

  if (user) {
    const populatedUser = await User.findById(user[0]._id).populate({
      path: 'subscription',
      populate: [
        {
          path: 'plan', // Populate the SubscriptionPlan details
          select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
        },
        {
          path: 'individualSubscriptions', // Populate contentId in individualSubscriptions
          select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields
        },
      ],
    });

    // Generate JWT token
    const token = generateToken({ id: user[0]._id, email: user[0].email });

    // Send success response
    const response = new ApiResponse(201, 'User registered successfully', {
      userId: user[0]._id,
      email: user[0].email,
      isPremium: user[0].isPremium,
      userDetails: userDetail[0],
      subscription: populatedUser.subscription
        ? {
            plan: populatedUser.subscription.plan
              ? {
                  type: populatedUser.subscription.plan.type,
                  startDate: populatedUser.subscription.plan.startDate,
                  endDate: populatedUser.subscription.plan.endDate,
                  status: populatedUser.subscription.plan.status,
                }
              : null,
            individualSubscriptions:
              populatedUser.subscription.individualSubscriptions?.map(
                (sub) => ({
                  contentType: sub.contentType,
                  contentId: sub.contentId, // Content ID or populated content details
                  status: sub.status,
                  startDate: sub.startDate,
                  endDate: sub.endDate,
                })
              ) || [],
          }
        : null,
      token,
    });
    return res.status(response.statusCode).json(response);
  }

  // If user creation fails
  throw new ApiError(500, 'Failed to register user');
});

// Get OTP for Sign-Up or Forgot Password
export const getOTP = asyncHandler(async (req, res) => {
  console.log("qorking");
  const { email, action } = req.body;

  // Validate required fields
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }
  if (!action) {
    throw new ApiError(400, 'Action is required');
  }

  // Check user existence based on action
  const existingUser = await User.findOne({ email });

  if (action === OTP_ACTION.signup) {
    if (existingUser) {
      throw new ApiError(400, 'User already exists. Please log in.');
    }
  } else if (action === OTP_ACTION.forgotpass) {
    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    } else if (existingUser.provider == 'google') {
      throw new ApiError(400, 'User not found');
    }
  } else {
    throw new ApiError(400, 'Invalid action type');
  }

  // Generate OTP
  const otpCode = generateOTP();

  // Send OTP via email
  const subject =
    action === 'signup'
      ? 'Sign-Up OTP Verification'
      : 'Forgot Password OTP Verification';
  const text = `Your OTP is ${otpCode}. It will expire in 10 minutes.`;
  const html = `<p>Your OTP is <b>${otpCode}</b>. It will expire in 10 minutes.</p>`;

  await sendMail({ to: email, subject, text, html });

  // Respond with success and OTP
  const response = new ApiResponse(200, 'OTP sent successfully to your email', {
    otp: otpCode,
  });
  res.status(response.statusCode).json(response);
});

// Function to reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  // Validate required fields
  if (!email || !newPassword) {
    throw new ApiError(400, 'Email and new password are required');
  }

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Update the user's password (hashing is handled in the model)
  user.password = newPassword;
  await user.save();

  // Respond with success
  const response = new ApiResponse(200, 'Password reset successfully', null);
  res.status(response.statusCode).json(response);
});
// Admin Login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const admin = await Admin.findOne(
    { email, password },
    'name email phone profileImage'
  );
  if (!admin) {
    throw new ApiError(404, 'Invalid email or password');
  }

  const token = generateToken({ id: admin._id, email: admin.email });

  const response = new ApiResponse(200, 'Admin logged in successfully', {
    token,
    admin,
  });
  return res.status(response.statusCode).json(response);
});

/*
export const logout = (req, res) => {
  try {
    // Invalidate the token by clearing it from the client
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    // Send a successful response
    const response = new ApiResponse(200, 'User logged out successfully', null);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any unexpected errors
    throw new ApiError(500, 'Logout failed', [], error.stack);
  }
};

// Generates a new token when the existing one expires.
export const refreshToken = (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    const newToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Handles login via third-party providers like Google.
export const socialLogin = async (req, res) => {
  try {
    const { email, name, profilePictureURL, provider } = req.body;

    const userSnapshot = await getDocs(
      query(collection(firestoreDb, 'users'), where('email', '==', email))
    );

    if (userSnapshot.empty) {
      // Create a new user if they don't already exist
      const newUser = {
        name,
        email,
        provider,
        profilePictureURL,
        role: 'student',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const userRef = await addDoc(collection(firestoreDb, 'users'), newUser);
      return res.status(201).json({
        message: 'User registered via social login',
        userId: userRef.id,
      });
    }

    res.status(200).json({ message: 'User logged in via social login' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login via social provider' });
  }
};
*/
