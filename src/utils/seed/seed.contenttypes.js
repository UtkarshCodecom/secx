import { asyncHandler } from '../asyncHandler.js';
import { ApiResponse } from '../ApiResponse.js';
import { ContentType } from '../../models/contenttypes.model.js';

export const seedContentTypeData = asyncHandler(async (req, res) => {
  const seedContentData = [
    { contentType: 'Course' },
    { contentType: 'Event' },
    { contentType: 'Pathway' },
    { contentType: 'Podcast' },
    { contentType: 'Quiz' },
  ];

  await ContentType.deleteMany(); // Delete existing data

  const contentTypeData = await ContentType.create(seedContentData);

  if (!contentTypeData) {
    throw new ApiError(500, 'Failed to create content types');
  }

  const response = new ApiResponse(
    201,
    'Content Types created successfully',
    contentTypeData
  );
  return res.status(response.statusCode).json(response);
});
