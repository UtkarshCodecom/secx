import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: [5, 'Description must be at least 5 characters long'],
      maxLength: [1000, 'Description cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);