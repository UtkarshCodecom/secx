import { Course } from "../models/course.model.js";
import { Event } from "../models/event.model.js";
import { Pathway } from "../models/pathway.model.js";
import { Podcast } from "../models/podcast.model.js";
import { QuizModule } from "../models/quiz.model.js";

// Generate OTP
export const generateOTP = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

// Function to generate a random username
export const generateUsername = () => {
  const length = 4; // Length of the random part
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'; // Characters to choose from
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomString += chars[randomIndex];
  }

  return `user_${randomString}`;
};

// Function to generate a random profile image
export const getRandomProfileImage = () => {
  const urls = [
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_16.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_14.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_30.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_32.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_35.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_34.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_22.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_21.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_3.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_26.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_17.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_2.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_23.png',
    'https://cdn.jsdelivr.net/gh/alohe/memojis/png/memo_27.png',
  ];

  const randomIndex = Math.floor(Math.random() * urls.length);
  return urls[randomIndex];
};

export const OTP_ACTION = {
  signup: 'signup',
  forgotpass: 'forgotpass',
};

export const getContentModel = (contentType) => {
  const ModelMap = {
    Course,
    Pathway,
    Quiz: QuizModule,
    Event,
    Podcast,
  };

  const ContentModel = ModelMap[contentType];
  if (!ContentModel) {
    throw new ApiError(500, 'Content type model not configured');
  }

  return ContentModel;
};