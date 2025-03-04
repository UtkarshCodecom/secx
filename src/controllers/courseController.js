import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Course } from '../models/course.model.js';
import { deleteFileFromAwsS3, uploadFileToAwsS3 } from '../config/s3Use.js';
import path from 'path';
import { awsFolderNames } from '../services/awsS3connect.js';
import { validateId } from '../utils/validateId.js';
import { UserCourseProgress } from '../models/usercourseprogress.model.js';
import { User } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import { verifyUserAccessMethod } from './contentController.js';
import { getS3KeyFromUrl } from '../utils/fileUtils.js';

// 1. Get list of all courses
export const getAllCoursesWithProgress = asyncHandler(async (req, res) => {
  const { userId } = req.body; // Get the user ID from the request body

  // Fetch all courses with only the required fields
  const courses = await Course.find(
    {},
    'title subtitle thumbnailUrl duration price isFree'
  );

  // Validate user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Fetch all progress records for the user
  const allProgress = await UserCourseProgress.find({ userId });

  // Map the courses array to include progress for each course
  const coursesWithProgress = courses.map((course) => {
    // Find progress for this specific course
    const courseProgress = allProgress.find(
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

  const response = new ApiResponse(200, 'Courses retrieved successfully', {
    courses: coursesWithProgress,
  });
  return res.status(response.statusCode).json(response);
});

// 2. Get course by ID
export const getCourseById = asyncHandler(async (req, res) => {
  const { userId, courseId } = req.body;

  // validateId(userId, 'User ID'); // Validate user ID
  // validateId(courseId, 'Course ID'); // Validate course ID

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const accessObject = await verifyUserAccessMethod(userId, 'Course', courseId);

  const course = await Course.findById(courseId).populate('sections.lessons'); // Fetch course with all sections and lessons
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  // Fetch user progress for the specific course
  const progress = await UserCourseProgress.findOne({ userId, courseId });

  // Build response
  const response = new ApiResponse(200, 'Course details', {
    courseDetails: course,
    accessObject,
    progress: progress || {
      completedLessons: [],
      progress: 0,
      lastAccessedAt: null,
    }, // Default progress object if none exists
  });

  return res.status(response.statusCode).json(response);
});

// 3. Mark lesson as completed
export const markLessonCompleted = asyncHandler(async (req, res) => {
  const { userId, courseId, sectionId, lessonId } = req.body;

  // Validate user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Validate course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  // Find the user's course progress
  const progress = await UserCourseProgress.findOne({ userId, courseId });

  // If no progress exists, create a new entry
  if (!progress) {
    const newProgress = new UserCourseProgress({
      userId,
      courseId,
      completedLessons: [
        {
          lessonId,
          sectionId,
          completedAt: new Date(),
          isCompleted: true,
        },
      ],
      lastAccessedAt: new Date(),
      progress:
        (1 /
          course.sections.reduce(
            (sum, section) => sum + section.lessons.length,
            0
          )) *
        100,
    });

    await newProgress.save();
    return res
      .status(200)
      .json(new ApiResponse(200, 'Lesson marked as completed', newProgress));
  }

  // Check if the lesson exists in completedLessons
  const existingLesson = progress.completedLessons.find(
    (lesson) => lesson.lessonId.toString() === lessonId
  );

  if (existingLesson) {
    // Toggle isCompleted
    existingLesson.isCompleted = !existingLesson.isCompleted;
    if (existingLesson.isCompleted) {
      existingLesson.completedAt = new Date(); // Update completedAt if marking as completed
    } else {
      existingLesson.completedAt = null; // Clear completedAt if marking as incomplete
    }
  } else {
    // Add new lesson to completedLessons
    progress.completedLessons.push({
      lessonId,
      sectionId,
      completedAt: new Date(),
      isCompleted: true,
    });
  }

  // Recalculate progress percentage
  const totalLessons = course.sections.reduce(
    (sum, section) => sum + section.lessons.length,
    0
  );
  progress.progress =
    (progress.completedLessons.filter((lesson) => lesson.isCompleted).length /
      totalLessons) *
    100;

  // Update last accessed time and save progress
  progress.lastAccessedAt = new Date();
  await progress.save();

  return res
    .status(200)
    .json(new ApiResponse(200, 'Lesson marked as completed', progress));
});

// 4. Get Course Progress
export const getCourseProgress = asyncHandler(async (req, res) => {
  const { userId, courseId } = req.body;

  validateId(userId, 'User ID'); // Validate user ID
  validateId(courseId, 'Course ID'); // Validate course ID

  // Fetch user and course
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  const progress = await UserCourseProgress.findOne({ userId, courseId });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Progress fetched successfully', progress));
});

/*----------------------------------------------- */

/* API Methods for ADMIN */
// Create Course
export const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    description,
    price,
    duration,
    thumbnailUrl = '',
    certificateURL = '',
    sections = [], // Array of sections with nested lessons
    isFree = false,
    category = '',
  } = req.body;

  // 1. Validate required course fields
  if (!title || !subtitle || !description || !duration) {
    throw new ApiError(400, 'Basic course details are required');
  }

  // 2. Validate price based on isFree flag
  if (!isFree && (!price || price <= 0)) {
    throw new ApiError(400, 'Price is required for paid courses');
  }

  // 3. Handle thumbnail upload
  // const file = req.file;
  // if (!file) {
  //   throw new ApiError(400, 'Course thumbnail is required');
  // }

  // const thumbnailUrl = await uploadCourseThumbnail(file, title);
  // if (!thumbnailUrl) {
  //   throw new ApiError(500, 'Failed to upload course thumbnail');
  // }

  // 4. Validate sections and lessons structure
  if (!Array.isArray(sections)) {
    throw new ApiError(400, 'Sections must be an array');
  }

  // 5. Validate each section and its lessons
  const validatedSections = sections.map((section, sectionIndex) => {
    if (!section.title) {
      throw new ApiError(
        400,
        `Section title is required for section ${sectionIndex + 1}`
      );
    }

    if (!Array.isArray(section.lessons)) {
      throw new ApiError(
        400,
        `Lessons must be an array in section ${sectionIndex + 1}`
      );
    }

    // Validate each lesson in the section
    const validatedLessons = section.lessons.map((lesson, lessonIndex) => {
      if (!lesson.title || !lesson.videoUrl || !lesson.duration) {
        throw new ApiError(
          400,
          `Missing required fields in lesson ${lessonIndex + 1} of section ${
            sectionIndex + 1
          }`
        );
      }

      return {
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        lessonThumbnailUrl: lesson.lessonThumbnailUrl,
      };
    });

    return {
      title: section.title,
      lessons: validatedLessons,
    };
  });

  // 6. Create the course with all data
  try {
    const course = await Course.create({
      title,
      subtitle,
      description,
      thumbnailUrl,
      price,
      duration,
      certificateURL,
      isFree,
      category,
      sections: validatedSections,
    });

    const response = new ApiResponse(201, 'Course created successfully', {
      course: {
        _id: course._id,
        title: course.title,
        subtitle: course.subtitle,
        thumbnailUrl: course.thumbnailUrl,
        price: course.price,
        duration: course.duration,
        sectionsCount: course.sections.length,
        totalLessons: course.sections.reduce(
          (total, section) => total + section.lessons.length,
          0
        ),
      },
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Clean up the uploaded thumbnail if course creation fails
    // Assuming you have a deleteFile utility
    await deleteFile(thumbnailUrl);
    throw new ApiError(
      500,
      `Failed to create course: ${error.message || 'Unknown error'}`
    );
  }
});

// Update Course
export const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params; // Course ID from URL params
  const {
    title,
    subtitle,
    description,
    price,
    duration,
    thumbnailUrl,
    certificateURL,
    sections = [],
    isFree,
    category,
  } = req.body;

  // 1. Validate course ID
  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  // 2. Validate required fields for updates
  if (!title || !subtitle || !description || !duration) {
    throw new ApiError(400, 'Basic course details are required');
  }

  // 3. Validate price for paid courses
  if (!isFree && (!price || price <= 0)) {
    throw new ApiError(400, 'Price is required for paid courses');
  }

  // 4. Validate sections and lessons structure
  if (!Array.isArray(sections)) {
    throw new ApiError(400, 'Sections must be an array');
  }

  const validatedSections = sections.map((section, sectionIndex) => {
    if (!section.title) {
      throw new ApiError(
        400,
        `Section title is required for section ${sectionIndex + 1}`
      );
    }

    if (!Array.isArray(section.lessons)) {
      throw new ApiError(
        400,
        `Lessons must be an array in section ${sectionIndex + 1}`
      );
    }

    // Validate each lesson
    const validatedLessons = section.lessons.map((lesson, lessonIndex) => {
      if (!lesson.title || !lesson.videoUrl || !lesson.duration) {
        throw new ApiError(
          400,
          `Missing required fields in lesson ${lessonIndex + 1} of section ${
            sectionIndex + 1
          }`
        );
      }

      return {
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        lessonThumbnailUrl: lesson.lessonThumbnailUrl,
      };
    });

    return {
      title: section.title,
      lessons: validatedLessons,
    };
  });

  // 5. Handle thumbnail replacement
  let newThumbnailUrl = thumbnailUrl;
  if (req.file) {
    // Assume `uploadCourseThumbnail` uploads the file and returns the URL
    newThumbnailUrl = await uploadCourseThumbnail(req.file, title);

    // Clean up the old thumbnail if replaced
    if (course.thumbnailUrl) {
      await deleteFile(course.thumbnailUrl);
    }
  }

  // 6. Update the course
  try {
    course.title = title;
    course.subtitle = subtitle;
    course.description = description;
    course.thumbnailUrl = newThumbnailUrl || course.thumbnailUrl;
    course.price = price;
    course.duration = duration;
    course.certificateURL = certificateURL;
    course.isFree = isFree;
    course.category = category;
    course.sections = validatedSections;

    await course.save();

    const response = new ApiResponse(200, 'Course updated successfully', {
      course: {
        _id: course._id,
        title: course.title,
        subtitle: course.subtitle,
        thumbnailUrl: course.thumbnailUrl,
        price: course.price,
        duration: course.duration,
        sectionsCount: course.sections.length,
        totalLessons: course.sections.reduce(
          (total, section) => total + section.lessons.length,
          0
        ),
      },
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Clean up the new thumbnail if the update fails
    if (req.file) {
      await deleteFile(newThumbnailUrl);
    }

    throw new ApiError(
      500,
      `Failed to update course: ${error.message || 'Unknown error'}`
    );
  }
});

// Delete Course
export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // First fetch the course with all necessary fields
  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError(404, 'Course not found');
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
            folderName
          });
        }
      } catch (error) {
        console.error(`Error deleting file: ${fileUrl}`, error);
      }
    }
  };

  // Delete course thumbnail
  await deleteFileIfExists(course.thumbnailUrl, awsFolderNames.course_thumbnail);

  // Delete course certificate if exists
  await deleteFileIfExists(course.certificateURL, awsFolderNames.course_certificate);

  // Delete all section files
  for (const section of course.sections) {
    // Delete lesson files in each section
    for (const lesson of section.lessons) {
      // Delete lesson video if exists
      await deleteFileIfExists(lesson.videoUrl, awsFolderNames.course_video);

      // Delete lesson thumbnail if exists
      await deleteFileIfExists(lesson.lessonThumbnailUrl, awsFolderNames.course_thumbnail);
    }
  }

  // Finally delete the course from database
  await Course.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Course deleted successfully', course));
});

/*----------------------------------------------- */

// Unified method for file uploads
export const handleFileUpload = asyncHandler(async (req, res) => {
  const { type } = req.params; // Type of file (e.g., 'thumbnail', 'certificate')
  const file = req.file;
  const { oldFileUrl } = req.body;

  
  if (!file) {
    throw new ApiError(400, 'No file uploaded');
  }

  // Map types to folder names
  const folderMapping = {
    thumbnail: awsFolderNames.thumbnail,
    video: awsFolderNames.video,
    certificate: awsFolderNames.certificate,
    // thumbnail: 'course_thumbnail',
    // certificate: 'course_certificate',
    // quiz_image: 'quiz_image',
    // quiz_certificate: 'quiz_certificate',
    // pathway_image: 'pathway_image',
  };

  const folderName = folderMapping[type];
  if (!folderName) {
    throw new ApiError(400, 'Invalid file type');
  }

  const fileName = `${type}_${Date.now()}${path.extname(file.originalname)}`; // Generate unique file name
  const filePath = file.path; // Local path of the uploaded file

  console.log('File Name: ', fileName);
  console.log('File Path: ', filePath);

  // Upload the file to S3
  const uploadResult = await uploadFileToAwsS3({
    fileName,
    filePath,
    folderName,
  });

  if (!uploadResult || !uploadResult.success) {
    throw new ApiError(500, `Failed to upload ${type}`);
  }

  // Delete old file if it exists
  if (oldFileUrl) {
    const s3Key = getS3KeyFromUrl(oldFileUrl);
    if (s3Key) {
      await deleteFileFromAwsS3({
        fileName: s3Key,
      });
    }
  }

  // console.log('Upload Result: ', uploadResult);

  // Return response
  const response = new ApiResponse(
    200,
    `${type.replace(/-/g, ' ')} uploaded successfully`,
    uploadResult.url
  );
  res.status(response.statusCode).json(response);
});

export const uploadVideo = asyncHandler(async (req, res) => {
  const file = req.file;
  const { oldFileUrl } = req.body;



  if (!file) {
    throw new ApiError(400, 'Video file is required');
  }

  if (oldFileUrl) {
    const s3Key = getS3KeyFromUrl(oldFileUrl);
    if (s3Key) {
      await deleteFileFromAwsS3({
        fileName: s3Key,
        filePath: oldFileUrl,
      });
    }
  }

  const filePath = file.path; // Local path of the uploaded file
  const fileName = `${uuidv4()}-${file.originalname}`;

  const uploadResult = await uploadFileToAwsS3({
    fileName,
    filePath,
    // folderName: awsFolderNames.course_video,
    folderName: awsFolderNames.video,
    isVideo: true,
  });

  if (!uploadResult || !uploadResult.success) {
    throw new ApiError(500, 'Failed to upload video');
  }

  console.log('Upload Result: ', uploadResult);
  console.log('Old File Url: ', oldFileUrl);
  

  const response = new ApiResponse(200, 'Video uploaded successfully', {
    videoUrl: uploadResult.url,
  });
  return res.status(response.statusCode).json(response);
});

// const deleteFile = async (filePath) => {
//   try {
//     await deleteFileFromAwsS3({
//       fileName: path.basename(filePath),
//       filePath,
//     });
//   } catch (error) {
//     console.error('Error deleting file:', error);
//   }
// };