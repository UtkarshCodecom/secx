import mongoose from 'mongoose';

const defaultSettingSchema = new mongoose.Schema(
  {
    aiAccess: {
      cvRater: {
        maxAllowedAccess: {
          type: Number,
          default: 100,
        }
      },
      interviewTaker: {
        maxAllowedAccess: {
          type: Number,
          default: 100,
        }
      }
    }
  },
  {
    timestamps: true,
  }
);

export const DefaultSetting = mongoose.model('DefaultSetting', defaultSettingSchema); 