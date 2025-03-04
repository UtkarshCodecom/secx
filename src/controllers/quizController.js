import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { QuizModule } from '../models/quiz.model.js';
import { validateId } from '../utils/validateId.js';
import { verifyUserAccessMethod } from './contentController.js';
import { deleteFileFromAwsS3 } from '../config/s3Use.js';
import { getS3KeyFromUrl } from '../utils/fileUtils.js';
import { awsFolderNames } from '../services/awsS3connect.js';
import { shuffleArray } from '../utils/shuffleArray.js';


// Get a list of quiz modules only
export const getAllQuizModules = asyncHandler(async (req, res) => {
  const quizModules = await QuizModule.find({}).select(
    '_id name imageUrl isFree price'
  );

  if (!quizModules.length) {
    throw new ApiError(404, 'No quiz modules found');
  }

  const response = new ApiResponse(
    200,
    'Quiz modules fetched successfully',
    quizModules
  );
  return res.status(response.statusCode).json(response);
});

// Get a quiz module by ID, including its sections and its quizzes but exclude questions
export const getQuizModuleById = asyncHandler(async (req, res) => {
  const { userId, quizModuleId } = req.body;

  validateId(quizModuleId, 'Quiz Module ID'); // Validate quiz module ID

  const accessObject = await verifyUserAccessMethod(
    userId,
    'QuizModule',
    quizModuleId
  );

  const quizModule = await QuizModule.findById(quizModuleId).select({
    name: 1,
    imageUrl: 1,
    certificateURL: 1,
    isFree: 1,
    price: 1,
    'sections.name': 1,
    'sections.numberOfQuizzes': 1,
    'sections.hugeIconName': 1,
    'sections.quizzes.quizName': 1,
    'sections.quizzes.duration': 1,
    'sections._id': 1,
    'sections.quizzes._id': 1,
  });

  if (!quizModule) {
    throw new ApiError(404, 'Quiz module not found');
  }

  // Shuffle quizzes and limit them to a maximum count
  const MAX_QUIZZES_PER_SECTION = 10;
  const updatedSections = quizModule.sections.map((section) => {
    const shuffledQuizzes = shuffleArray(section.quizzes); // Shuffle quizzes
    const limitedQuizzes = shuffledQuizzes.slice(0, MAX_QUIZZES_PER_SECTION); // Limit to MAX_QUIZZES_PER_SECTION
    return {
      ...section,
      quizzes: limitedQuizzes, // Replace with the shuffled and limited quizzes
    };
  });

  quizModule.sections = updatedSections; // Update sections in the quizModule

  const response = new ApiResponse(200, 'Quiz module fetched successfully', {
    quizModule,
    accessObject,
  });
  return res.status(response.statusCode).json(response);
});

// Get all quiz questions for a specific section ID
export const getQuizQuestions = asyncHandler(async (req, res) => {
  const { sectionId, quizId } = req.body;

  validateId(sectionId, 'Section ID'); // Validate section ID

  const quizModule = await QuizModule.findOne({
    'sections._id': sectionId,
  }).select('sections');

  if (!quizModule) {
    throw new ApiError(404, 'Section not found');
  }

  const section = quizModule.sections.find((sec) => sec.id === sectionId);

  if (!section) {
    throw new ApiError(404, 'Section not found');
  }

  validateId(quizId, 'Quiz ID'); // Validate quiz ID

  // Find the specific quiz within the section
  const quiz = section.quizzes.find((quiz) => quiz.id === quizId);

  if (!quiz) {
    throw new ApiError(404, 'Quiz not found in this section');
  }

  // Get questions for the specific quiz only
  const questions = quiz.questions;

  const response = new ApiResponse(
    200,
    'Questions fetched successfully',
    questions
  );
  return res.status(response.statusCode).json(response);
});

// create quiz
export const createQuiz = asyncHandler(async (req, res) => {
  const {
    name,
    imageUrl = '',
    certificateURL = '',
    isFree = false,
    price = 0,
    sections = [], // Array of sections with nested quizzes
  } = req.body;

  // 1. Validate required fields for the Quiz Module
  if (!name) {
    throw new ApiError(400, 'Name is required.');
  }

  // 2. Validate price based on the isFree flag
  if (!isFree && (!price || price <= 0)) {
    throw new ApiError(400, 'Price is required for paid quiz modules.');
  }

  // 3. Validate sections and quizzes structure
  if (!Array.isArray(sections)) {
    throw new ApiError(400, 'Sections must be an array.');
  }

  // 4. Validate each section, its quizzes, and questions
  const validatedSections = sections.map((section, sectionIndex) => {
    if (!section.name) {
      throw new ApiError(
        400,
        `Section name is required for section ${sectionIndex + 1}.`
      );
    }

    if (!Array.isArray(section.quizzes)) {
      throw new ApiError(
        400,
        `Quizzes must be an array in section ${sectionIndex + 1}.`
      );
    }

    // Validate each quiz in the section
    const validatedQuizzes = section.quizzes.map((quiz, quizIndex) => {
      if (!quiz.quizName || !quiz.duration) {
        throw new ApiError(
          400,
          `Missing required fields in quiz ${quizIndex + 1} of section ${
            sectionIndex + 1
          }.`
        );
      }

      if (!Array.isArray(quiz.questions)) {
        throw new ApiError(
          400,
          `Questions must be an array in quiz ${quizIndex + 1} of section ${
            sectionIndex + 1
          }.`
        );
      }

      // Validate each question in the quiz
      const validatedQuestions = quiz.questions.map(
        (question, questionIndex) => {
          if (
            !question.question ||
            !Array.isArray(question.answerOptions) ||
            !question.correctAnswer
          ) {
            throw new ApiError(
              400,
              `Missing required fields in question ${
                questionIndex + 1
              } of quiz ${quizIndex + 1} in section ${sectionIndex + 1}.`
            );
          }

          return {
            question: question.question,
            answerOptions: question.answerOptions,
            correctAnswer: question.correctAnswer,
          };
        }
      );

      return {
        quizName: quiz.quizName,
        duration: quiz.duration,
        certificate: quiz.certificate || '',
        questions: validatedQuestions,
      };
    });

    return {
      name: section.name,
      numberOfQuizzes: section.numberOfQuizzes || validatedQuizzes.length,
      hugeIconName: section.hugeIconName || '',
      quizzes: validatedQuizzes,
    };
  });

  // 5. Create the Quiz Module
  try {
    const quizModule = await QuizModule.create({
      name,
      imageUrl,
      certificateURL,
      isFree,
      price,
      sections: validatedSections,
    });

    // const response = new ApiResponse(201, 'Quiz module created successfully.', {
    //   quizModule: {
    //     _id: quizModule._id,
    //     name: quizModule.name,
    //     imageUrl: quizModule.imageUrl,
    //     price: quizModule.price,
    //     isFree: quizModule.isFree,
    //     sectionsCount: quizModule.sections.length,
    //     totalQuizzes: quizModule.sections.reduce(
    //       (total, section) => total + section.quizzes.length,
    //       0
    //     ),
    //   },
    // });

    return res
      .status(201)
      .json(new ApiResponse(201, 'Quiz module created successfully'));
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to create quiz module: ${error.message || 'Unknown error'}.`
    );
  }
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    imageUrl = '',
    certificateURL = '',
    isFree = false,
    price = 0,
    sections = [],
  } = req.body;

  // 1. Validate required fields
  if (!name) {
    throw new ApiError(400, 'Name is required.');
  }

  // 2. Validate price for paid modules
  if (!isFree && (!price || price <= 0)) {
    throw new ApiError(400, 'Price is required for paid quiz modules.');
  }

  // 3. Validate sections, quizzes, and questions
  const validatedSections = sections.map((section, sectionIndex) => {
    if (!section.name) {
      throw new ApiError(
        400,
        `Section name is required for section ${sectionIndex + 1}.`
      );
    }

    if (!Array.isArray(section.quizzes)) {
      throw new ApiError(
        400,
        `Quizzes must be an array in section ${sectionIndex + 1}.`
      );
    }

    const validatedQuizzes = section.quizzes.map((quiz, quizIndex) => {
      if (!quiz.quizName || !quiz.duration) {
        throw new ApiError(
          400,
          `Missing required fields in quiz ${quizIndex + 1} of section ${
            sectionIndex + 1
          }.`
        );
      }

      if (!Array.isArray(quiz.questions)) {
        throw new ApiError(
          400,
          `Questions must be an array in quiz ${quizIndex + 1} of section ${
            sectionIndex + 1
          }.`
        );
      }

      const validatedQuestions = quiz.questions.map(
        (question, questionIndex) => {
          if (
            !question.question ||
            !Array.isArray(question.answerOptions) ||
            !question.correctAnswer
          ) {
            throw new ApiError(
              400,
              `Missing required fields in question ${
                questionIndex + 1
              } of quiz ${quizIndex + 1} in section ${sectionIndex + 1}.`
            );
          }

          return {
            question: question.question,
            answerOptions: question.answerOptions,
            correctAnswer: question.correctAnswer,
          };
        }
      );

      return {
        quizName: quiz.quizName,
        duration: quiz.duration,
        certificate: quiz.certificate || '',
        questions: validatedQuestions,
      };
    });

    return {
      name: section.name,
      numberOfQuizzes: section.numberOfQuizzes || validatedQuizzes.length,
      hugeIconName: section.hugeIconName || '',
      quizzes: validatedQuizzes,
    };
  });

  // 4. Update Quiz Module
  try {
    const quizModule = await QuizModule.findById(id);
    if (!quizModule) {
      throw new ApiError(404, 'Quiz module not found.');
    }

    quizModule.name = name;
    quizModule.imageUrl = imageUrl;
    quizModule.certificateURL = certificateURL;
    quizModule.isFree = isFree;
    quizModule.price = isFree ? 0 : price;
    quizModule.sections = validatedSections;

    await quizModule.save();

    const response = new ApiResponse(200, 'Quiz module updated successfully.', {
      quizModule: {
        _id: quizModule._id,
        name: quizModule.name,
        imageUrl: quizModule.imageUrl,
        price: quizModule.price,
        isFree: quizModule.isFree,
        sectionsCount: quizModule.sections.length,
        totalQuizzes: quizModule.sections.reduce(
          (total, section) => total + section.quizzes.length,
          0
        ),
      },
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to update quiz module: ${error.message || 'Unknown error'}.`
    );
  }
});

// Delete quiz by ID
export const deleteQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // First fetch the quiz with all necessary fields
  const quiz = await QuizModule.findById(id);
  if (!quiz) {
    throw new ApiError(404, 'Quiz not found');
  }

  // Helper function to delete file from S3 if exists
  const deleteFileIfExists = async (fileUrl, folderName) => {
    if (fileUrl) {
      try {
        const s3Key = getS3KeyFromUrl(fileUrl);
        if (s3Key) {
          await deleteFileFromAwsS3({
            fileName: s3Key,
            filePath: fileUrl,
            folderName,
          });
        }
      } catch (error) {
        console.error(`Error deleting file: ${fileUrl}`, error);
      }
    }
  };

  // Delete quiz thumbnail
  await deleteFileIfExists(quiz.thumbnailUrl, awsFolderNames.quiz_thumbnail);

  // Finally delete the quiz from database
  await QuizModule.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Quiz deleted successfully', quiz));
});
