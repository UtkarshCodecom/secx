import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Event } from '../models/event.model.js';
import { Pathway } from '../models/pathway.model.js';
import { Course } from '../models/course.model.js';
import { QuizModule } from '../models/quiz.model.js';
import { Podcast } from '../models/podcast.model.js';
import { UserCourseProgress } from '../models/usercourseprogress.model.js';
import { UserPathwayProgress } from '../models/userpathwayprogress.model.js';

export const getHomeScreenData = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Fetch 4 recent items from each collection
  const events = await Event.find()
    .limit(3)
    .sort({ createdAt: -1 })
    .select(
      '_id title venue totalSlots remainingSlots thumbnailUrl eventDate eventTime isFree price'
    ); // Sort by newest
  const pathways = await Pathway.find()
    .limit(3)
    .sort({ createdAt: -1 })
    .select('_id title imageUrl isFree price');
  const courses = await Course.find()
    .limit(3)
    .sort({ createdAt: -1 })
    .select('_id title subtitle thumbnailUrl duration isFree price');
  const quizes = await QuizModule.find()
    .limit(3)
    .sort({ createdAt: -1 })
    .select('_id name imageUrl isFree price');
  const podcasts = await Podcast.find()
    .limit(3)
    .sort({ createdAt: -1 })
    .select('_id title thumbnailUrl duration creator tags isFree price');

  // Fetch all progress records for the user
  const allCourseProgress = await UserCourseProgress.find({ userId });

  // Map the courses array to include progress for each course
  const coursesWithProgress = courses.map((course) => {
    // Find progress for this specific course
    const courseProgress = allCourseProgress.find(
      (progress) => progress.courseId.toString() === course._id.toString()
    );

    // Return course object with progress data
    return {
      ...course.toObject(),
      progress: courseProgress || {
        completedLessons: [],
        progress: 0,
        lastAccessedAt: null,
        courseId: course._id,
        userId,
      },
    };
  });

  // Fetch all progress records for the user
  const allPathwayProgress = await UserPathwayProgress.find({ userId });

  // Map the pathways array to include progress for each pathway
  const pathwaysWithProgress = pathways.map((pathway) => {
    // Find progress for this specific pathway
    const pathwayProgress = allPathwayProgress.find(
      (progress) => progress.pathwayId.toString() === pathway._id.toString()
    );

    // Return pathway object with progress data
    return {
      ...pathway.toObject(),
      progress: pathwayProgress || {
        completedLessons: [],
        progress: 0,
        lastAccessedAt: null,
        pathwayId: pathway._id,
        userId,
      },
    };
  });

  // Construct response
  const response = new ApiResponse(
    200,
    'Home screen data retrieved successfully',
    {
      pathways: pathwaysWithProgress,
      courses: coursesWithProgress, // Use the updated courses with progress
      quizes,
      podcasts,
      events,
    }
  );

  return res.status(response.statusCode).json(response);
});
