import mongoose from 'mongoose';

const FCMTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add compound index for userId and token
FCMTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

export const FCMToken = mongoose.model('FCMToken', FCMTokenSchema);
