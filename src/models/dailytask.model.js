import mongoose from 'mongoose';

const dailyTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    hugeIcon: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      enum: ['daily', 'lifetime'],
      required: true,
    },
    taskIdentifier: {
      type: String,
      required: true,
      // unique: true,
      // enum: [
      //   'daily_login',
      //   'daily_quiz',
      //   'daily_video',
      //   'daily_mining',
      //   'daily_invite',
      //   'daily_checklist',
      //   'lifetime_google_review',
      //   'lifetime_social_share',
      //   'lifetime_invite_friends',
      // ],
    },
    requiredCount: {
      type: Number,
      default: 1, // For tasks like "Watch 3 videos"
    },
    rewardAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const DailyTask = mongoose.model('DailyTask', dailyTaskSchema);
