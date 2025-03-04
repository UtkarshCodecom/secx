import mongoose from 'mongoose';

const userTaskProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyTask',
      required: true,
    },
    lastClaimedAt: {
      type: Date,
      required: true,
    },
    completionCount: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
userTaskProgressSchema.index({ userId: 1, taskId: 1 });

export const UserTaskProgress = mongoose.model(
  'UserTaskProgress',
  userTaskProgressSchema
);
