import express from 'express'; // Importing the Express framework
import passport from 'passport'; // Importing the Passport authentication middleware
import {
  login,
  register,
  getOTP,
  resetPassword,
  adminLogin,
} from '../controllers/authController.js'; // Importing authentication controller functions

const router = express.Router(); // Creating a new router instance

// Route for logging in a user
router.post('/login', login); // Handles user login

// Route for registering a new user
router.post('/register', register); // Handles user registration 

// Route for requesting an OTP for email verification during sign-up
router.post('/get-otp', getOTP); // Handles sending OTP for email verification OR forgot password 

// Route for resetting the password after verifying OTP
router.post('/reset-password', resetPassword); // Handles password reset functionality

// Admin Login
router.post('/admin-login', adminLogin);

/* TODO Implement the Cookies for WEB
// Logs out the user by invalidating their refresh token
router.post('/logout', logout);

// Generates a new refresh token when the existing one expires
router.post('/refresh-token', refreshToken);

// Handles login via third-party providers like Google
router.post('/social-login', socialLogin);



// // Google OAuth routes
// router.get(
//   '/oAuth2/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// ); // Initiates Google authentication
// router.get(
//   '/oAuth2/google/callback',
//   passport.authenticate('google', { session: false }),
//   googleAuth
// ); // Handles callback after Google authentication

// // GitHub OAuth routes
// router.get(
//   '/oAuth2/github',
//   passport.authenticate('github', { scope: ['user:email'] })
// ); // Initiates GitHub authentication
// router.get(
//   '/oAuth2/github/callback',
//   passport.authenticate('github', { session: false }),
//   githubAuth
// ); // Handles callback after GitHub authentication

// // Discord OAuth routes
// router.get('/oAuth2/discord', passport.authenticate('discord')); // Initiates Discord authentication
// router.get(
//   '/oAuth2/discord/callback',
//   passport.authenticate('discord', { session: false }),
//   discordAuth
// ); // Handles callback after Discord authentication
*/
export default router; // Exporting the router to be used in other parts of the application