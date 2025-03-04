import express from 'express';
import cors from 'cors'; // Importing the cors middleware for enabling Cross-Origin Resource Sharing
import dotenv from 'dotenv';
import { ApiError } from './utils/ApiError.js';
import config from './config/config.js';
import { connectDB } from './config/database.js'; // Importing the connectDB function to connect to the database

// Routes
import authRoutes from './routes/auth.route.js'; // Importing the authentication routes
import userRoutes from './routes/user.route.js'; // Importing the user routes
import checklistRoutes from './routes/checklist.route.js'; // Importing the checklist routes
import courseRoutes from './routes/course.route.js'; // Importing the course routes
import quizRoutes from './routes/quiz.routes.js'; // Importing the quiz routes
import pathwaysRoutes from './routes/pathway.route.js'; // Importing the quiz routes
import podcastRoutes from './routes/podcast.route.js'; // Importing the quiz routes
import eventRoutes from './routes/event.route.js'; // Importing the quiz routes
import homeRoutes from './routes/home.route.js'; // Importing the home routes
import contentAccessRoutes from './routes/contentAccess.route.js'; // Importing the content access routes
import fcmRoutes from './routes/fcm.route.js'; // Importing the fcm routes
import dailyTaskRoutes from './routes/dailytask.route.js'; // Importing the daily task routes
import feedbackRoutes from './routes/feedback.route.js'; // Importing the feedback routes
import miningRoutes from './routes/mining.route.js'; // Importing the mining routes
import adminRoutes from './routes/admin.route.js'; // Importing the admin routes
// seeding data
import { seedContentTypeData } from './utils/seed/seed.contenttypes.js';
import { seedSubscriptionPlans } from './utils/seed/seed.subplans.js';
import {
  createOrder,
  getSubscriptionPlans,
  insertPayment,
} from './controllers/razorpayController.js';
import { seedAppConfig } from './utils/seed/seed.appconfig.js';
import { getAppConfig } from './controllers/appconfigController.js';
import { MiningService } from './services/miningService.js';
import { initializeDefaultSettings } from './init/createDefaultSettings.js';
import commonRoutes from './routes/common.route.js';

dotenv.config(); // Load environment variables from .env file

const app = express(); // Creating an instance of the express application

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Simple get API method
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

const version = process.env.VERSION;

// Setting up API routes
app.use(`/api/${version}/auth`, authRoutes); // Mount the auth routes at /api/auth
app.use(`/api/${version}/user`, userRoutes); // Mount the user routes at /api/user
app.use(`/api/${version}/checklist`, checklistRoutes); // Mount the checklist routes at /api/checklist
app.use(`/api/${version}/courses`, courseRoutes); // Mount the course routes at /api/course
app.use(`/api/${version}/quiz`, quizRoutes); // Mount the quiz routes at /api/quiz
app.use(`/api/${version}/pathways`, pathwaysRoutes); // Mount the quiz routes at /api/quiz
app.use(`/api/${version}/podcast`, podcastRoutes); // Mount the quiz routes at /api/quiz
app.use(`/api/${version}/event`, eventRoutes); // Mount the event routes at /api/event
app.use(`/api/${version}/home`, homeRoutes); // Mount the home routes at /api/home
app.use(`/api/${version}/content`, contentAccessRoutes); // Mount the content access routes at /api/content
app.use(`/api/${version}/fcm`, fcmRoutes); // Mount the fcm routes at /api/fcm
app.use(`/api/${version}/daily-tasks`, dailyTaskRoutes); // Mount the daily task routes at /api/daily-tasks
app.use(`/api/${version}/feedback`, feedbackRoutes); // Mount the feedback routes at /api/feedback
app.use(`/api/${version}/mining`, miningRoutes); // Mount the mining routes at /api/mining
app.use(`/api/${version}/admin`, adminRoutes); // Mount the admin routes at /api/admin
app.use(`/api/${version}/common`, commonRoutes); // Mount the common routes at /api/common

// API methods
app.post(`/api/${version}/create-order`, createOrder);
app.post(`/api/${version}/insert-payment`, insertPayment);
app.get(`/api/${version}/get-app-config`, getAppConfig);

// Route to seed content types
// app.get('/api/v1/seed-contenttype', seedContentTypeData);
app.get('/api/v1/seed-subscriptionplans', seedSubscriptionPlans);
app.get('/api/v1/get-subscription-plans', getSubscriptionPlans);
app.get('/api/v1/seed-appconfig', seedAppConfig);

connectDB()
  .then(() => {
    const PORT = config.port || 8001;
    app.listen(PORT, () => {
      console.log(`⚙️  Server is listening on port :${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Error Occurs: ', err);
  });

// initialize default settings
// initializeDefaultSettings();

  // Initialize the mining service
MiningService.initializeCronJob();

// GLobal catch handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  if (err instanceof ApiError) {
    // Handle custom ApiError
    const { statusCode, message, data, errors } = err;
    return res.status(200).json({
      // for app api response
      status: 'failure',
      message,
      data,
      errors,
      statusCode,
    });
  }


  // Handle other errors
  res.status(200).json({
    status: 'failure',
    message: err.message || 'Internal Server Error',
    data: null,
    errors: [],
    statusCode: 500,
  });
});
