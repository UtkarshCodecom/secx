import express from 'express'; // Importing the Express framework
import {
  getUserProfile,
  updateUserProfile,
  updateProfileImage,
  getUserStreak,
  getUserAIAccess,
  updateUserAIAccess,
  getUserWalletDetails,
  pingAllInvities,
  deleteUserAccount,
} from '../controllers/userController.js'; // Importing user controller functions
import upload from '../middlewares/upload.js';

const router = express.Router(); // Creating a new router instance

// FOR APP
// Route to get user profile
router.get('/profile/:id', getUserProfile);

// Route to update user details
router.post('/update-profile/:id', updateUserProfile);

// Route to update user profile image
router.post(
  '/update-profile-image/:id',
  upload.single('profileImage'),
  updateProfileImage
);

// route for delete account
router.get('/delete-account/:id', deleteUserAccount);


// ROUTE FOR STREAK
router.get('/streak/:userId', getUserStreak);

// ROUTE FOR AI Access
router.post('/ai-access', getUserAIAccess);
router.post('/update-ai-access', updateUserAIAccess);

// ROUTE FOR WALLET
router.get('/wallet/:userId', getUserWalletDetails);

// ROUTE FOR PINGING ALL INVITIES
router.get('/ping-all-invities/:userId', pingAllInvities);


/*  FOR WEB
// Route to get user profile
router.get('/profile', authenticateJWT, getUserProfile);

// Route to update user details
router.post('/update-profile/:id', authenticateJWT, updateUserProfile);
*/

/* CRUD Implementation for Admin
// Route to create a new user
router.post('/create', authenticateJWT, authorizeRole(['admin']), createUser); // Requires authentication and admin role

// Route to get all users
router.get('/', authenticateJWT, getUsers); // Requires authentication

// Route to get a single user by ID
router.get('/:id', authenticateJWT, getUserById); // Requires authentication

// Route to update a user by ID
router.put(
  '/:id/update',
  authenticateJWT,
  authorizeRole(['admin']),
  updateUser
); // Requires authentication

// Route to delete a user by ID
router.delete(
  '/:id/delete',
  authenticateJWT,
  authorizeRole(['admin']),
  deleteUser
); // Requires authentication and admin role
*/
export default router; // Exporting the router to be used in other parts of the application
