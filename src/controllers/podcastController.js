import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateId } from '../utils/validateId.js';
import { Podcast } from '../models/podcast.model.js';
import { verifyUserAccessMethod } from './contentController.js';
import { deleteFileFromAwsS3 } from '../config/s3Use.js';
import { getS3KeyFromUrl } from '../utils/fileUtils.js';
import { awsFolderNames } from '../services/awsS3connect.js';

// 1. Fetch all podcasts
export const getAllPodcasts = asyncHandler(async (req, res) => {
  const podcasts = await Podcast.find(
    {},
    'title thumbnailUrl duration creator tags isFree price'
  ); // Fetch only the necessary fields

  if (!podcasts || podcasts.length === 0) {
    throw new ApiError(404, 'No podcasts found');
  }

  const response = new ApiResponse(
    200,
    'Podcasts retrieved successfully',
    podcasts
  );
  return res.status(response.statusCode).json(response);
});

// 2. Fetch a podcast by ID
export const getPodcastById = asyncHandler(async (req, res) => {
  const { userId, podcastId } = req.body;
  // Validate the ID format
  validateId(podcastId, 'Podcast ID');

  const accessObject = await verifyUserAccessMethod(
    userId,
    'Podcast',
    podcastId
  );

  const podcast = await Podcast.findById(podcastId).select(
    '-createdAt -updatedAt -__v -category'
  ); // Exclude createdAt, updatedAt, and __v

  if (!podcast) {
    throw new ApiError(404, 'Podcast not found');
  }

  const response = new ApiResponse(200, 'Podcast retrieved successfully', {
    podcast,
    accessObject,
  });
  return res.status(response.statusCode).json(response);
});

// Create a new Podcast
export const createPodcast = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    videoUrl = '',
    duration,
    thumbnailUrl = '',
    publishedDate,
    creator,
    category,
    tags = [],
    isFree,
    price,
  } = req.body;

  // 1. Validate required podcast fields
  if (!title || !description || !duration || !creator) {
    throw new ApiError(400, 'Basic podcast details are required');
  }
  // 2. Validate price based on isFree flag
  if (!isFree && (!price || price <= 0)) {
    throw new ApiError(400, 'Price is required for paid podcasts');
  }

  // Create a new podcast document
  const newPodcast = new Podcast({
    title,
    description,
    duration,
    thumbnailUrl,
    videoUrl,
    publishedDate,
    creator,
    category,
    tags: tags || [],
    isFree,
    price,
  });

  if (!newPodcast) {
    throw new ApiError(400, 'Failed to create podcast');
  }

  // Save to the database
  await newPodcast.save();

  return res
    .status(201)
    .json(new ApiResponse(201, 'Podcast created successfully!'));
});

export const updatePodcast = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the podcast ID from the request parameters
  const {
    title,
    description,
    videoUrl,
    duration,
    thumbnailUrl,
    publishedDate,
    creator,
    category,
    tags,
    isFree,
    price,
  } = req.body;

  const podcast = await Podcast.findById(id);

  if (!podcast) {
    throw new ApiError(404, 'Podcast not found');
  }

  // Find and update the podcast document
  await Podcast.findByIdAndUpdate(
    id,
    {
      title: title ?? podcast.title,
      description: description ?? podcast.description,
      videoUrl: videoUrl ?? podcast.videoUrl,
      duration: duration ?? podcast.duration,
      thumbnailUrl: thumbnailUrl ?? podcast.thumbnailUrl,
      publishedDate: publishedDate ?? podcast.publishedDate,
      creator: creator ?? podcast.creator,
      category: category ?? podcast.category,
      tags: tags ?? podcast.tags,
      isFree: isFree ?? podcast.isFree,
      price: price ?? podcast.price,
    },
    { new: true, runValidators: true } // Return the updated document and run validation
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Podcast updated successfully!'));
});

// Delete podcast by ID
export const deletePodcast = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // First fetch the podcast with all necessary fields
  const podcast = await Podcast.findById(id);
  if (!podcast) {
    throw new ApiError(404, 'Podcast not found');
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

  // Delete podcast thumbnail
  await deleteFileIfExists(
    podcast.thumbnailUrl,
    awsFolderNames.podcast_thumbnail
  );

  // Delete podcast audio file
  await deleteFileIfExists(podcast.audioUrl, awsFolderNames.podcast_audio);

  // Finally delete the podcast from database
  await Podcast.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Podcast deleted successfully', podcast));
});
