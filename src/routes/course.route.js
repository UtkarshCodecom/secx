// routes/checklistRoutes.js
import express from 'express';
import {
  // getAllCourses,
  getCourseById,
  createCourse,
  markLessonCompleted,
  getCourseProgress,
  getAllCoursesWithProgress,  
} from '../controllers/courseController.js';
import { seedCourseData } from '../utils/seed/seed.course.js';

const router = express.Router();

router.get('/seed-courses', seedCourseData); // Route to seed course data

// router.get('/get-all-courses', getAllCourses); // Route to get the list of all courses
router.post('/get-all-courses', getAllCoursesWithProgress); // Route to get the list of all courses

router.post('/get-course', getCourseById); // Route to get a course by ID

// Route to mark a lesson as completed
router.post('/mark-as-complete', markLessonCompleted);

// Route to get the progress of a course
router.post('/progress', getCourseProgress);

// Route for creating a new course
router.post('/create-course', createCourse);

// // Route for uploading a thumbnail
// router.post('/upload-thumbnail', upload.single('file'), uploadImage);
// // Route for uploading a certificate
// router.post('/upload-certificate', upload.single('file'), uploadImage);



export default router;