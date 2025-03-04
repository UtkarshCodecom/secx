import express from 'express';
import {
  // getAllPathways,
  getAllPathwaysWithProgress,
  getPathwayById,
  getPathwayLessons,
  markPathwayLessonCompleted
} from '../controllers/pathwayController.js';
import { seedPathwayData } from '../utils/seed/seed.pathway.js';

const router = express.Router();

// POST /api/pathways/seed-pathway
// Seed pathway data for testing/development
router.get('/seed-pathway', seedPathwayData);

// GET /api/pathways/get-all-pathways
// Get a list of all available pathways
// router.get('/get-all-pathways', getAllPathways);
router.post('/get-all-pathways', getAllPathwaysWithProgress);

// GET /api/pathways/get-pathway/:id
// Get a specific pathway by ID
router.post('/get-pathway', getPathwayById);

// GET /api/pathways/sections/:sectionId/lessons/:lessonId
// Get a specific lesson within a section
router.post(
  '/get-pathway-lessons',
  getPathwayLessons
);


// Route to mark a lesson as completed
router.post('/mark-completed', markPathwayLessonCompleted);
export default router;
