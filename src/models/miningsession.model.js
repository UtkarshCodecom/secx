import mongoose, { Schema } from 'mongoose';

// Mining Session Schema
const MiningSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['RUNNING', 'COMPLETED', 'STOPPED'],
      default: 'RUNNING',
    },
    baseCoins: { type: Number, default: 100 },
    bonusCoins: { type: Number, default: 0 },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    // lastAdWatchTime: { type: Date },
  },
  { timestamps: true }
);

// Add indexes for better performance
MiningSessionSchema.index({ status: 1, endTime: 1 });
MiningSessionSchema.index({ user: 1, status: 1 });

export const MiningSession = mongoose.model('MiningSession', MiningSessionSchema);
