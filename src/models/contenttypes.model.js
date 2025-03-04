import mongoose, { Schema } from 'mongoose';

export const ContentSchema = new Schema(
  {
    contentType: {
      type: String,
      enum: ['Pathway', 'Course', 'QuizModule', 'Event', 'Podcast'],
      required: true,
    }, // Defines the type of content
  },
  { timestamps: true }
);

export const ContentType = mongoose.model('ContentType', ContentSchema);
