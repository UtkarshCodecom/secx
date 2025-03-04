import mongoose from 'mongoose';
import { DefaultSetting } from './defaultsetting.model.js';

const aiAccessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    productAccess: {
      cvRater: {
        accessCount: {
          type: Number,
          default: 0,
        }
      },
      interviewTaker: {
        accessCount: {
          type: Number,
          default: 0,
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if user can access specific AI product
aiAccessSchema.methods.canAccessAI = async function (product) {
  const defaultSetting = await DefaultSetting.findOne();
  if (!defaultSetting) {
    throw new Error('Default settings not found');
  }
  
  return this.productAccess[product].accessCount < defaultSetting.aiAccess[product].maxAllowedAccess;
};

// Helper method to increment access count for specific product
aiAccessSchema.methods.incrementAccess = async function (product) {
  this.productAccess[product].accessCount += 1;
  await this.save();
  return this.canAccessAI(product);
};

export const AIAccess = mongoose.model('AIAccess', aiAccessSchema);
