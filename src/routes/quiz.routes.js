import express from 'express';
import {
  getAllQuizModules,
  getQuizModuleById,
  getQuizQuestions,
} from '../controllers/quizController.js';
import { seedQuizData } from '../utils/seed/seed.quiz.js';

const router = express.Router();

// Seed route
router.get('/seed-quiz', seedQuizData);

// GET /api/quiz-modules
// Get a list of all quiz modules
router.get('/get-quiz-modules', getAllQuizModules);

// GET /api/quiz-modules/:id
// Get a specific quiz module by ID
router.post('/get-quiz-modules', getQuizModuleById);

// GET /api/quiz-questions/:sectionId
// Get questions for a specific section
router.post('/get-quiz-questions', getQuizQuestions);
export default router;
