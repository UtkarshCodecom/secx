import mongoose from 'mongoose';

const UserPathwayProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pathwayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pathway',
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

// Add unique index for userId and pathwayId
UserPathwayProgressSchema.index({ userId: 1, pathwayId: 1 }, { unique: true });

export const UserPathwayProgress = mongoose.model(
  'UserPathwayProgress',
  UserPathwayProgressSchema
);
