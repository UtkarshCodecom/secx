import { asyncHandler } from '../asyncHandler.js';
import { ApiResponse } from '../ApiResponse.js';
import { Podcast } from '../../models/podcast.model.js';

export const seedPodcastData = asyncHandler(async (req, res) => {
  const podcasts = [
    {
      title: 'Global Cybersecurity Conference 2024',
      description:
        'Join top industry leaders and experts to discuss emerging cybersecurity trends, technologies, and strategies for 2024. Gain insights from keynote speakers, panel discussions, and breakout sessions.',
      venue: 'Moscone Center, San Francisco, CA',
      totalSlots: 500,
      remainingSlots: 120,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-04-15T09:00:00Z',
      eventTime: '9:00 AM - 5:00 PM',
      creator: 'CyberTech Global',
      duration: '8 hours',
      videoUrl: 'https://youtu.be/vK4Mno4QYqk?si=AunAoGfT2LBGMFH1',
      tags: ['Cybersecurity', 'Networking', 'Ethical Hacking'],
    },
    {
      title: 'Cybersecurity Workshop: Mastering Penetration Testing',
      description:
        'A hands-on workshop where participants will learn the essentials of penetration testing, including vulnerability scanning, ethical hacking, and reporting findings. Suitable for beginners and intermediate learners.',
      venue: 'WeWork, Austin, TX',
      totalSlots: 50,
      remainingSlots: 18,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1590494165264-1ebe3602eb80?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl:
        'https://images.unsplash.com/photo-1590494165264-1ebe3602eb80?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-06-10T14:00:00Z',
      eventTime: '2:00 PM - 6:00 PM',
      creator: 'Ethical Hackers Network',
      duration: '4 hours',
      videoUrl: 'https://youtu.be/s19BxFpoSd0?si=YRa_OWrDQLm1SwQ1',
      tags: ['Penetration Testing', 'Ethical Hacking', 'Cybersecurity'],
    },
    {
      title: 'Hackathon: Build the Next Cyber Defense Tool',
      description:
        'Collaborate with developers, security experts, and designers to create innovative cybersecurity solutions in this 48-hour hackathon. Winners will receive exciting prizes and recognition in the industry.',
      venue: 'TechHub, New York City, NY',
      totalSlots: 200,
      remainingSlots: 50,
      thumbnailUrl: 'https://images.unsplash.com/photo-1638029202288-451a89e0d55f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl: 'https://images.unsplash.com/photo-1638029202288-451a89e0d55f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-07-20T10:00:00Z',
      eventTime: '10:00 AM - 12:00 PM (Next Day)',
      creator: 'Cyber Defense League',
      duration: '48 hours',
      videoUrl: 'https://youtu.be/nXkszWSJgQ0?si=pYdWXTNg9jNc0PB8',
      tags: ['Cybersecurity', 'Hackathon', 'Coding'],
    },
    {
      title: 'Advanced Cybersecurity Training: Cloud Security Essentials',
      description:
        'Enhance your knowledge of cloud security with this intensive training. Topics include secure cloud architecture, threat detection, and incident response in cloud environments. Ideal for professionals.',
      venue: 'The Shard, London, UK',
      totalSlots: 100,
      remainingSlots: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516044734145-07ca8eef8731?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl: 'https://images.unsplash.com/photo-1516044734145-07ca8eef8731?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-09-05T08:30:00Z',
      eventTime: '8:30 AM - 4:30 PM',
      creator: 'CloudSec Academy',
      duration: '8 hours',
      videoUrl: 'https://youtu.be/s19BxFpoSd0?si=YRa_OWrDQLm1SwQ1',
      tags: ['Cloud Security', 'Networking', 'Cybersecurity'],
    },
    {
      title: 'Cybersecurity Networking Night',
      description:
        'Connect with cybersecurity professionals, recruiters, and enthusiasts at this exclusive networking event. Share experiences, explore opportunities, and build valuable connections in the industry.',
      venue: 'CIC, Boston, MA',
      totalSlots: 150,
      remainingSlots: 75,
      thumbnailUrl: 'https://plus.unsplash.com/premium_photo-1684522167826-a473e63337b1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      footerImageUrl: 'https://plus.unsplash.com/premium_photo-1684522167826-a473e63337b1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      eventDate: '2024-11-18T17:00:00Z',
      eventTime: '5:00 PM - 8:00 PM',
      creator: 'CyberConnect Events',
      duration: '3 hours',
      videoUrl: 'https://youtu.be/s19BxFpoSd0?si=YRa_OWrDQLm1SwQ1',
      tags: ['Networking', 'Ethical Hacking', 'Cybersecurity'],
    },
  ];

  await Podcast.deleteMany(); // Delete existing data

  const CreatedPodcasts = await Podcast.create(podcasts);

  if (!CreatedPodcasts) {
    throw new ApiError(500, 'Failed to create podcasts');
  }

  const response = new ApiResponse(
    201,
    'Podcasts created successfully',
    CreatedPodcasts
  );
  return res.status(response.statusCode).json(response);
});
