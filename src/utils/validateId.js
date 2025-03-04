import mongoose from 'mongoose';
import { ApiError } from './ApiError.js';

export const validateId = (ID, idType = 'ID') => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(ID)) {
      throw new ApiError(400, `Invalid ${idType} format`);
    }
};


