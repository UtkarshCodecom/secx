import { DefaultSetting } from '../models/defaultsetting.model.js';

export const initializeDefaultSettings = async () => {
  const existingSettings = await DefaultSetting.findOne();
  
  if (!existingSettings) {
    await DefaultSetting.create({
      aiAccess: {
        cvRater: {
          maxAllowedAccess: 100
        },
        interviewTaker: {
          maxAllowedAccess: 100
        }
      }
    });
  }
}; 