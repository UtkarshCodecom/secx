import mongoose from 'mongoose';

// Define the Lesson schema
const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    htmlContent: {
      type: String,
      required: true, // Store the HTML content as a string
    },
    videoUrl: {
      type: String,
      required: false, // Video URL is optional
      default: '',
    },
    lessonThumbnailUrl: {
      type: String,
      required: false,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Define the Section schema
const SectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lessons: [LessonSchema], // Embed lessons as an array within the section
  },
  {
    timestamps: true,
  }
);

// Define the Pathway schema
const PathwaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false, // Image URL for the pathway
    },
    sections: [SectionSchema], // Embed sections as an array within the pathway
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
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
const Pathway = mongoose.model('Pathway', PathwaySchema);

export { Pathway };
