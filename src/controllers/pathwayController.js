import { Pathway } from '../models/pathway.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateId } from '../utils/validateId.js';
import { UserPathwayProgress } from '../models/userpathwayprogress.model.js';
import { verifyUserAccessMethod } from './contentController.js';
import { deleteFileFromAwsS3 } from '../config/s3Use.js';
import { getS3KeyFromUrl } from '../utils/fileUtils.js';
import { awsFolderNames } from '../services/awsS3connect.js';
// Get all pathways
export const getAllPathwaysWithProgress = asyncHandler(async (req, res) => {
  const { userId } = req.body; // Get the user ID from the request body

  // Fetch all pathways with only the required fields
  const pathways = await Pathway.find({}, 'title imageUrl _id isFree price');

  if (!pathways || pathways.length === 0) {
    throw new ApiError(404, 'No pathways found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Fetch all progress records for the user
  const allProgress = await UserPathwayProgress.find({ userId });

  // Map the pathways array to include progress for each pathway
  const pathwaysWithProgress = pathways.map((pathway) => {
    // Find progress for this specific pathway
    const pathwayProgress = allProgress.find(
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

  const response = new ApiResponse(
    200,
    'Pathways fetched successfully',
    pathwaysWithProgress
  );
  return res.status(response.statusCode).json(response);
});

// Get a specific pathway by ID
export const getPathwayById = asyncHandler(async (req, res) => {
  const { userId, pathwayId } = req.body;

  validateId(pathwayId, 'Pathway ID'); // Validate pathway ID

  // Validate user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const accessObject = await verifyUserAccessMethod(
    userId,
    'Pathway',
    pathwayId
  );

  // Find pathway by ID and populate related sections and lessons
  const pathway = await Pathway.findById(pathwayId).select({
    title: 1,
    imageUrl: 1,
    isFree: 1,
    price: 1,
    'sections._id': 1,
    'sections.title': 1,
    'sections.lessons._id': 1,
    'sections.lessons.title': 1,
  });

  if (!pathway) {
    throw new ApiError(404, 'Pathway not found');
  }

  // Fetch user progress for the specific pathway
  const progress = await UserPathwayProgress.findOne({ userId, pathwayId });

  // Build response
  const response = new ApiResponse(200, 'Pathway details', {
    pathwayDetails: pathway,
    accessObject,
    progress: progress || {
      completedLessons: [],
      progress: 0,
      lastAccessedAt: null,
    }, // Default progress object if none exists
  });

  return res.status(response.statusCode).json(response);
});

// Get a specific lesson by ID
export const getPathwayLessons = asyncHandler(async (req, res) => {
  const { sectionId, lessonId, userId } = req.body;

  validateId(sectionId, 'Section ID');
  validateId(lessonId, 'Lesson ID');
  validateId(userId, 'User ID');

  // Find the pathway section
  const pathwaySection = await Pathway.findOne({
    'sections._id': sectionId,
  }).select('sections _id');

  if (!pathwaySection) {
    throw new ApiError(404, 'Section not found');
  }

  // Find the specific lesson within the section
  const lesson = pathwaySection.sections
    .find((section) => section._id.toString() === sectionId)
    .lessons.find((lesson) => lesson._id.toString() === lessonId);

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found in this section');
  }

  // Check if the lesson is completed by the user
  const userProgress = await UserPathwayProgress.findOne({
    userId,
    pathwayId: pathwaySection._id,
    'completedLessons.lessonId': lessonId,
  });

  // Exclude createdAt, updatedAt, and __v fields
  const { createdAt, updatedAt, __v, ...lessonData } = lesson.toObject();

  // Add isCompleted field to the response
  const responseData = {
    ...lessonData,
    isCompleted: userProgress ? true : false,
  };

  const response = new ApiResponse(
    200,
    'Lesson fetched successfully',
    responseData
  );
  return res.status(response.statusCode).json(response);
});

// Mark Pathway Lesson Completed
// export const markPathwayLessonCompleted = asyncHandler(async (req, res) => {
//   const { userId, pathwayId, sectionId, lessonId } = req.body;

//   // Validate user
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new ApiError(404, 'User not found');
//   }

//   // Validate course
//   const pathway = await Pathway.findById(pathwayId);
//   if (!pathway) {
//     throw new ApiError(404, 'Pathway not found');
//   }

//   // Check if lesson is already completed
//   const existingProgress = await UserPathwayProgress.findOne({
//     userId,
//     pathwayId,
//     'completedLessons.lessonId': lessonId,
//   });

//   if (existingProgress) {
//     throw new ApiError(400, 'Lesson already marked as completed');
//   }

//   // If not completed, mark it as completed
//   const progress = await UserPathwayProgress.findOneAndUpdate(
//     { userId, pathwayId },
//     {
//       $addToSet: {
//         completedLessons: {
//           lessonId,
//           sectionId,
//           completedAt: new Date(),
//           isCompleted: true,
//         },
//       },
//       lastAccessedAt: new Date(),
//     },
//     { upsert: true, new: true }
//   );

//   if (!progress) {
//     throw new ApiError(404, 'Error while updating pathway progress');
//   }

//   // Calculate progress percentage
//   const totalLessons = pathway.sections.reduce(
//     (sum, section) => sum + section.lessons.length,
//     0
//   );

//   // Update progress percentage
//   progress.progress = (progress.completedLessons.length / totalLessons) * 100;
//   await progress.save();

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, 'Pathway progress updated successfully', progress)
//     );
// });

// Updated Mark Pathway Lesson Completed
export const markPathwayLessonCompleted = asyncHandler(async (req, res) => {
  const { userId, pathwayId, sectionId, lessonId } = req.body;

  // Validate user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Validate pathway
  const pathway = await Pathway.findById(pathwayId);
  if (!pathway) {
    throw new ApiError(404, 'Pathway not found');
  }

  // Find or create user's pathway progress
  const progress = await UserPathwayProgress.findOne({
    userId,
    pathwayId,
  });

  if (!progress) {
    const newProgress = new UserPathwayProgress({
      userId,
      pathwayId,
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
          pathway.sections.reduce(
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

  // Check if the lesson is already in completedLessons
  const existingLesson = progress.completedLessons.find(
    (lesson) => lesson.lessonId.toString() === lessonId
  );

  if (existingLesson) {
    // Toggle isCompleted
    existingLesson.isCompleted = !existingLesson.isCompleted;
    if (existingLesson.isCompleted) {
      existingLesson.completedAt = new Date(); // Set completedAt if marking as completed
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
  const totalLessons = pathway.sections.reduce(
    (sum, section) => sum + section.lessons.length,
    0
  );

  progress.progress =
    (progress.completedLessons.filter((lesson) => lesson.isCompleted).length /
      totalLessons) *
    100;

  // Save updated progress
  await progress.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Pathway progress updated successfully', progress)
    );
});

// Create a new Pathway
export const createPathway = asyncHandler(async (req, res) => {
  const { title, imageUrl = '', isFree, price, sections = [] } = req.body;

  // Validate input
  if (!title) {
    throw new ApiError(400, 'Title is required');
  }

  // Create a new Pathway instance
  const pathway = new Pathway({
    title,
    imageUrl,
    isFree: !!isFree,
    price: isFree ? 0 : price || 0,
    sections,
  });

  if (!pathway) {
    throw new ApiError(400, 'Error while creating pathway');
  }

  // Save the Pathway to the database
  await pathway.save();

  return res
    .status(201)
    .json(new ApiResponse(201, 'Pathway created successfully'));
});

export const updatePathway = asyncHandler(async (req, res) => {
  const { id } = req.params; // Pathway ID from URL params
  const { title, imageUrl, isFree, price, sections = [] } = req.body;

  // 1. Validate pathway ID
  const pathway = await Pathway.findById(id);
  if (!pathway) {
    throw new ApiError(404, 'Pathway not found');
  }

  // 2. Validate required fields for updates
  if (!title) {
    throw new ApiError(400, 'Title is required');
  }

  // 3. Validate price for paid pathways
  if (!isFree && (!price || price <= 0)) {
    throw new ApiError(400, 'Price is required for paid pathways');
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
      if (!lesson.title) {
        throw new ApiError(
          400,
          `Lesson title is required in lesson ${lessonIndex + 1} of section ${
            sectionIndex + 1
          }`
        );
      }

      return {
        _id: lesson._id,
        title: lesson.title,
        htmlContent: lesson.htmlContent || '',
        videoUrl: lesson.videoUrl || '',
        lessonThumbnailUrl: lesson.lessonThumbnailUrl || '',
      };
    });

    return {
      _id: section._id,
      title: section.title,
      lessons: validatedLessons,
    };
  });

  // 5. Handle image replacement
  let newImageUrl = imageUrl;
  if (req.file) {
    // Assume `uploadPathwayImage` uploads the file and returns the URL
    newImageUrl = await uploadPathwayImage(req.file, title);

    // Clean up the old image if replaced
    if (pathway.imageUrl) {
      await deleteFile(pathway.imageUrl);
    }
  }

  // 6. Update the pathway
  try {
    pathway.title = title;
    pathway.imageUrl = newImageUrl || pathway.imageUrl;
    pathway.isFree = isFree;
    pathway.price = isFree ? 0 : price || pathway.price;
    pathway.sections = validatedSections;

    await pathway.save();

    const response = new ApiResponse(200, 'Pathway updated successfully', {
      pathway: {
        _id: pathway._id,
        title: pathway.title,
        imageUrl: pathway.imageUrl,
        price: pathway.price,
        sectionsCount: pathway.sections.length,
        totalLessons: pathway.sections.reduce(
          (total, section) => total + section.lessons.length,
          0
        ),
      },
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Clean up the new image if the update fails
    if (req.file) {
      await deleteFile(newImageUrl);
    }

    throw new ApiError(
      500,
      `Failed to update pathway: ${error.message || 'Unknown error'}`
    );
  }
});

// Update an existing Pathway
// export const updatePathway = asyncHandler(async (req, res) => {
//   const { id } = req.params; // Pathway ID
//   const { title, imageUrl, isFree, price, sections = [] } = req.body;

//   // Fetch the Pathway by ID
//   const pathway = await Pathway.findById(id);

//   if (!pathway) {
//     res.status(404);
//     throw new Error('Pathway not found');
//   }

//   // Update top-level fields
//   if (title) pathway.title = title;
//   if (imageUrl) pathway.imageUrl = imageUrl;
//   if (isFree !== undefined) {
//     pathway.isFree = isFree;
//     pathway.price = isFree ? 0 : price || 0;
//   }

//   // Update sections and lessons
//   if (sections.length > 0) {
//     sections.forEach((updatedSection) => {
//       const existingSection = pathway.sections.id(updatedSection._id); // Find section by ID

//       if (existingSection) {
//         // Update section fields
//         if (updatedSection.title) existingSection.title = updatedSection.title;

//         // Update lessons within the section
//         if (Array.isArray(updatedSection.lessons)) {
//           updatedSection.lessons.forEach((updatedLesson) => {
//             const existingLesson = existingSection.lessons.id(updatedLesson._id); // Find lesson by ID

//             if (existingLesson) {
//               // Update lesson fields
//               if (updatedLesson.title) existingLesson.title = updatedLesson.title;
//               if (updatedLesson.htmlContent)
//                 existingLesson.htmlContent = updatedLesson.htmlContent;
//               if (updatedLesson.videoUrl !== undefined)
//                 existingLesson.videoUrl = updatedLesson.videoUrl;
//             } else {
//               // Add new lesson if it doesn't exist
//               existingSection.lessons.push(updatedLesson);
//             }
//           });
//         }
//       } else {
//         // Add new section if it doesn't exist
//         pathway.sections.push(updatedSection);
//       }
//     });
//   }

//   // Save the updated Pathway to the database
//   const updatedPathway = await pathway.save();

//   res.status(200).json({
//     status: 'success',
//     message: 'Pathway updated successfully',
//     data: updatedPathway,
//   });
// });

// Delete pathway by ID
export const deletePathway = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // First fetch the pathway with all necessary fields
  const pathway = await Pathway.findById(id);
  if (!pathway) {
    throw new ApiError(404, 'Pathway not found');
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

  // Delete pathway thumbnail
  await deleteFileIfExists(
    pathway.thumbnailUrl,
    awsFolderNames.pathway_thumbnail
  );

  // Delete pathway certificate if exists
  await deleteFileIfExists(
    pathway.certificateURL,
    awsFolderNames.pathway_certificate
  );

  // Delete all section files
  for (const section of pathway.sections) {
    // Delete lesson files in each section
    for (const lesson of section.lessons) {
      // Delete lesson video if exists
      await deleteFileIfExists(lesson.videoUrl, awsFolderNames.pathway_video);

      // Delete lesson thumbnail if exists
      await deleteFileIfExists(
        lesson.thumbnailUrl,
        awsFolderNames.pathway_thumbnail
      );
    }
  }

  // Finally delete the pathway from database
  await Pathway.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Pathway deleted successfully', pathway));
});
