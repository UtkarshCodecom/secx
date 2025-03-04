import mongoose from 'mongoose';

const podcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: false,
      trim: true,
    },
    duration: {
      type: String, // Format: "45m", "1h 30m"
      required: true,
    },
    thumbnailUrl: {
      type: String, // For the podcast thumbnail image
      required: false,
      default: '',
      trim: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    creator: {
      type: String, // The creator of the podcast
      required: true,
      trim: true,
    },
    category: {
      type: String, // E.g., 'Education', 'Technology', 'Entertainment'
      default: 'General',
    },
    tags: {
      type: [String], // Array of relevant tags
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const Podcast = mongoose.model('Podcast', podcastSchema);