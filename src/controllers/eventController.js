import { Event } from '../models/event.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateId } from '../utils/validateId.js';
import { UserEventRegistration } from '../models/usereventregistration.model.js';
import { User } from '../models/user.model.js';
import { verifyUserAccessMethod } from './contentController.js';
import mongoose from 'mongoose';
import { deleteFileFromAwsS3 } from '../config/s3Use.js';
import { getS3KeyFromUrl } from '../utils/fileUtils.js';
import { awsFolderNames } from '../services/awsS3connect.js';


// Get list of all events
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find(
    {},
    'title venue totalSlots remainingSlots thumbnailUrl eventDate eventTime isFree price'
  ); // Fetch only required fields

  if (!events || events.length === 0) {
    throw new ApiError(404, 'No events found');
  }

  const response = new ApiResponse(
    200,
    'Events retrieved successfully',
    events
  );
  return res.status(response.statusCode).json(response);
});

// Get event by ID
export const getEventById = asyncHandler(async (req, res) => {
  const { userId, eventId } = req.body;

  validateId(eventId, 'Event ID'); // Validate event ID
  validateId(userId, 'User ID'); // Validate user ID

  const accessObject = await verifyUserAccessMethod(userId, 'Event', eventId);

  const event = await Event.findById(eventId).select(
    '-__v -createdAt -updatedAt'
  ); // Select only the necessary fields
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  let isRegistered = false;
  // Check if the user is already registered for the event
  const isAlreadyRegistered = await UserEventRegistration.findOne({
    userId,
    eventId,
  });

  if (isAlreadyRegistered) {
    // If the user is already registered, set isRegistered to true
    isRegistered = true;
  }

  const response = new ApiResponse(200, 'Event retrieved successfully', {
    ...event.toObject(),
    isRegistered,
    accessObject,
  });
  return res.status(response.statusCode).json(response);
});

// Register for an event
export const registerEvent = asyncHandler(async (req, res) => {
  const { userId, eventId } = req.body; // User ID from the request body (if needed for tracking registrations) & event ID

  validateId(userId, 'User ID'); // Validate user ID
  validateId(eventId, 'Event ID'); // Validate event ID

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Fetch the event
  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Check if slots are available
  if (event.remainingSlots <= 0) {
    throw new ApiError(400, 'No slots available for this event');
  }

  // Check if the user is already registered for the event
  const isAlreadyRegistered = await UserEventRegistration.findOne({
    userId,
    eventId,
  });

  if (isAlreadyRegistered) {
    throw new ApiError(400, 'User is already registered for this event');
  }

  // Register the user for the event
  await UserEventRegistration.create({ userId, eventId });

  // Decrease the remaining slots
  event.remainingSlots -= 1;

  // Save the updated event
  await event.save();

  const response = new ApiResponse(
    200,
    'Successfully registered for the event',
    { remainingSlots: event.remainingSlots }
  );
  return res.status(response.statusCode).json(response);
});

// Create event
export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    venue,
    totalSlots,
    thumbnailUrl = '',
    footerImageUrl = '',
    eventDate,
    eventTime,
    isFree,
    price,
  } = req.body;

  // Validate required fields
  if (
    !title ||
    !description ||
    !venue ||
    !totalSlots ||
    !eventDate ||
    !eventTime
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, 'All required fields must be provided.'));
  }

  // Ensure `totalSlots` is a positive number
  if (totalSlots <= 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, '`totalSlots` must be greater than 0.'));
  }

  // Ensure `eventDate` is a future date
  if (new Date(eventDate) < new Date()) {
    return res
      .status(400)
      .json(new ApiResponse(400, '`eventDate` must be a future date.'));
  }

  // If the event is free, ensure `price` is set to 0
  const validPrice = isFree ? 0 : price || 0;

  // Create the event
  const event = await Event.create({
    title,
    description,
    venue,
    totalSlots,
    remainingSlots: totalSlots,
    thumbnailUrl,
    footerImageUrl,
    eventDate,
    eventTime,
    isFree,
    price: validPrice,
  });

  if (!event) {
    throw new ApiError(500, 'An error occurred while creating the event.');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Event created successfully.', event));
});

// Update event by ID
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    venue,
    totalSlots,
    thumbnailUrl = '',
    footerImageUrl = '',
    eventDate,
    eventTime,
    isFree,
    price,
  } = req.body;

  // Validate ID
  validateId(id, 'Event ID');

  // Find the existing event
  const event = await Event.findById(id);

  if (!event) {
    throw new ApiError(404, 'Event not found.');
  }

  // Validate `totalSlots` if provided
  if (totalSlots !== undefined && totalSlots <= 0) {
    throw new ApiError(400, '`totalSlots` must be greater than 0.');
  }

  // Validate `eventDate` if provided
  if (eventDate !== undefined && new Date(eventDate) < new Date()) {
    throw new ApiError(400, 'Event date must be a future date.');
  }

  // If the event is free, ensure `price` is set to 0
  const validPrice = isFree ? 0 : price;

  // Update event fields
  event.title = title || event.title;
  event.description = description || event.description;
  event.venue = venue || event.venue;
  event.totalSlots = totalSlots || event.totalSlots;
  event.remainingSlots =
    totalSlots !== undefined
      ? Math.min(event.remainingSlots, totalSlots)
      : event.remainingSlots; // Adjust remaining slots only if totalSlots changes
  event.thumbnailUrl = thumbnailUrl || event.thumbnailUrl;
  event.footerImageUrl = footerImageUrl || event.footerImageUrl;
  event.eventDate = eventDate || event.eventDate;
  event.eventTime = eventTime || event.eventTime;
  event.isFree = isFree !== undefined ? isFree : event.isFree;
  event.price = validPrice !== undefined ? validPrice : event.price;

  // Save the updated event
  const updatedEvent = await event.save();

  if (!updatedEvent) {
    throw new ApiError(500, 'An error occurred while updating the event.');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Event updated successfully.', updatedEvent));
});

// Delete event by ID
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // First fetch the event with all necessary fields
  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
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

  // Delete event thumbnail
  await deleteFileIfExists(event.thumbnailUrl, awsFolderNames.event_thumbnail);

  // Delete event resources/attachments if they exist
  if (event.resources && event.resources.length > 0) {
    for (const resource of event.resources) {
      await deleteFileIfExists(
        resource.fileUrl,
        awsFolderNames.event_resources
      );
    }
  }

  // Finally delete the event from database
  await Event.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Event deleted successfully', event));
});
