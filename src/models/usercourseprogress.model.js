import mongoose from "mongoose";

// UserCourseProgress Schema
const UserCourseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedLessons: [
      {
        lessonId: String,
        sectionId: String,
        completedAt: Date,
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    lastAccessedAt: Date,
    progress: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add indexes
UserCourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const UserCourseProgress = mongoose.model(
  'UserCourseProgress',
  UserCourseProgressSchema
);
