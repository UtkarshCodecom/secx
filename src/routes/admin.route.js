import express from 'express'; // Importing the Express framework
import {
  sendFCMNotification,
  sendFCMNotificationToAllUsers,
  getAllCourses,
  getCourseById,
  getAllPathways,
  getPathwayById,
  getAllPodcasts,
  getPodcastById,
  getAllEvents,
  getEventById,
  getAllQuizzes,
  getQuizById,
  getAllUsers,
  getUserDetailById,
  getPaymentTransactions,
  getPaymentDetailsById,
  getDefaultSetting,
  updateDefaultSetting,
  getDashboardStats,
  getAllContentTypes,
  getAllSubscriptionPlans,
  upsertSubscriptionPlan,
  getIndividualSubscriptionPlan,
  getAllFeedbacks,
  giveAwayUser,
  getContentTitles,
  getGrantedUsers,
  updateAdminProfileImage,
  updateAdminProfile,
} from '../controllers/adminController.js'; // Importing authentication controller functions
import {
  createCourse,
  deleteCourse,
  handleFileUpload,
  updateCourse,
  uploadVideo,
} from '../controllers/courseController.js';
import {
  createPathway,
  deletePathway,
  updatePathway,
} from '../controllers/pathwayController.js';
import {
  createPodcast,
  deletePodcast,
  updatePodcast,
} from '../controllers/podcastController.js';
import {
  createQuiz,
  deleteQuiz,
  updateQuiz,
} from '../controllers/quizController.js';
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from '../controllers/eventController.js';
import upload from '../middlewares/upload.js';
import videoUpload from '../middlewares/videoupload.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = express.Router(); // Creating a new router instance

router.use(authenticateJWT);


// update profile image
router.put(
  '/update-profile-image',
  upload.single('profileImage'),
  updateAdminProfileImage
);

// update admin profile
router.put('/update-profile', updateAdminProfile);

/*----------------------------------------------- */

// route for getting all courses
router.get('/get-all-courses', getAllCourses);

// route for getting course by id
router.get('/get-course/:id', getCourseById);

// route for creating a course
router.post('/create-course', createCourse);

// route for updating a course
router.put('/update-course/:id', updateCourse);

// route for deleting course by id
router.delete('/delete-course/:id', deleteCourse);

/*----------------------------------------------- */

// route for getting all pathways
router.get('/get-all-pathways', getAllPathways);

// route for getting pathway by id
router.get('/get-pathway/:id', getPathwayById);

// route for creating a pathway
router.post('/create-pathway', createPathway);

// route for updating a pathway
router.put('/update-pathway/:id', updatePathway);

// route for deleting pathway by id
router.delete('/delete-pathway/:id', deletePathway);

/*----------------------------------------------- */

// route for getting all podcasts
router.get('/get-all-podcasts', getAllPodcasts);

// route for getting podcast by id
router.get('/get-podcast/:id', getPodcastById);

// route for creating a podcast
router.post('/create-podcast', createPodcast);

// route for updating a podcast
router.put('/update-podcast/:id', updatePodcast);

// route for deleting podcast by id
router.delete('/delete-podcast/:id', deletePodcast);

/*----------------------------------------------- */

// route for getting all events
router.get('/get-all-events', getAllEvents);

// route for getting event by id
router.get('/get-event/:id', getEventById);

// route for creating an event
router.post('/create-event', createEvent);

// route for updating an event
router.put('/update-event/:id', updateEvent);

// route for deleting event by id
router.delete('/delete-event/:id', deleteEvent);

/*----------------------------------------------- */

// route for getting all quizzes
router.get('/get-all-quizzes', getAllQuizzes);

// route for getting quiz by id
router.get('/get-quiz/:id', getQuizById);

// route for creating a quiz
router.post('/create-quiz', createQuiz);

// route for updating a quiz
router.put('/update-quiz/:id', updateQuiz);

// route for deleting quiz by id
router.delete('/delete-quiz/:id', deleteQuiz);

/*----------------------------------------------- */

// Route for sending FCM notification
router.post('/sendFCMNotification', sendFCMNotification); // Handles user login

// Route for sending FCM notification to all users
router.post('/sendFCMNotificationToAllUsers', sendFCMNotificationToAllUsers); // Handles user login

/*----------------------------------------------- */

// route for getting all users
router.get('/get-all-users', getAllUsers);

// Route for getting detailed user information by ID
router.get('/get-user-detail/:userId', getUserDetailById);

/*----------------------------------------------- */

// route for getting payment transactions
router.get('/get-payment-transactions', getPaymentTransactions);

// route for getting detailed payment information by ID
router.get('/get-payment-detail/:paymentId', getPaymentDetailsById);

/*----------------------------------------------- */

// route for getting default setting
router.get('/get-app-setting', getDefaultSetting);

// route for updating default setting
router.put('/update-app-setting', updateDefaultSetting);

/*----------------------------------------------- */

// Dashboard statistics route
router.get('/dashboard-stats', getDashboardStats);

/*----------------------------------------------- */

// route for getting all content types
router.get('/get-all-content-types', getAllContentTypes);

// route for getting all subscription plans
router.get('/get-all-subscription-plans', getAllSubscriptionPlans);

// route for getting individual subscription plan
router.get('/get-subscription-plan/:id', getIndividualSubscriptionPlan);

// route for creating or updating a subscription plan
router.post('/upsert-subscription-plan/:id?', upsertSubscriptionPlan);

/*----------------------------------------------- */

// route for getting all feedbacks
router.get('/get-all-feedbacks', getAllFeedbacks);

// Unified route for file uploads
router.post('/file/upload/:type', upload.single('file'), handleFileUpload);

// Route for uploading a video
router.post('/file/upload-video', videoUpload.single('file'), uploadVideo);

/*----------------------------------------------- */

// Route for granting access to users
router.post('/give-away-user', giveAwayUser);

// Route for getting content titles by type
router.get('/get-contents/:contentType', getContentTitles);

/*----------------------------------------------- */

// Route for getting all users with admin-granted access
router.get('/granted-users', getGrantedUsers);

export default router; // Exporting the router to be used in other parts of the application
