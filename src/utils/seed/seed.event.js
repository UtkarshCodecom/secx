import { asyncHandler } from '../asyncHandler.js';
import { ApiResponse } from '../ApiResponse.js';
import { Event } from '../../models/event.model.js';

export const seedEventData = asyncHandler(async (req, res) => {
  const events = [
    {
      title: 'National Music Fest',
      description:
        'Join us for an unforgettable night of music and celebration at the National Music Fest.',
      venue: 'Indore City, MP',
      totalSlots: 100,
      remainingSlots: 10,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-08-25',
      eventTime: '4pm - 12pm',
    },
    {
      title: 'Tomorrowland Tech Conference',
      description:
        'Discover the future of technology with industry leaders at the Tomorrowland Tech Conference.',
      venue: 'Mumbai, Maharashtra',
      totalSlots: 200,
      remainingSlots: 50,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1700936655679-83f4b37d7d74?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl:
        'https://images.unsplash.com/photo-1700936655679-83f4b37d7d74?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-09-15',
      eventTime: '10am - 6pm',
    },
    {
      title: 'Startup Pitch Fest',
      description:
        'Showcase your startup ideas to investors and mentors at the Startup Pitch Fest.',
      venue: 'Bangalore, Karnataka',
      totalSlots: 150,
      remainingSlots: 25,
      thumbnailUrl:
        'https://plus.unsplash.com/premium_photo-1678453146852-63702e69c26d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl:
        'https://plus.unsplash.com/premium_photo-1678453146852-63702e69c26d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-10-10',
      eventTime: '11am - 3pm',
    },
    {
      title: 'Art and Culture Carnival',
      description:
        'Immerse yourself in a celebration of art and culture at this vibrant carnival.',
      venue: 'Jaipur, Rajasthan',
      totalSlots: 300,
      remainingSlots: 80,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1607346704958-4cfdbd7dc1c8?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl:
        'https://images.unsplash.com/photo-1607346704958-4cfdbd7dc1c8?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-12-05',
      eventTime: '3pm - 9pm',
    },
    {
      title: 'Health and Wellness Expo',
      description:
        'Explore innovative health and wellness solutions at this comprehensive expo.',
      venue: 'Delhi, NCR',
      totalSlots: 250,
      remainingSlots: 100,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=1406&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl:
        'https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=1406&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-11-20',
      eventTime: '9am - 5pm',
    },
  ];

  await Event.deleteMany(); // Delete existing data
  const CreatedEvents = await Event.create(events);

  if (!CreatedEvents) {
    throw new ApiError(500, 'Failed to create Events');
  }

  const response = new ApiResponse(
    201,
    'Events created successfully',
    CreatedEvents
  );
  return res.status(response.statusCode).json(response);
});
