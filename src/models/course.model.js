import mongoose from "mongoose";

// Define the Lesson schema
const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    lessonThumbnailUrl: {
      type: String,
      required: false,
      default: '',
    },
    duration: {
      type: String,
      required: true,
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

// Define the Course schema
const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    certificateURL: {
      type: String, // Could be a URL or a string identifier for the certificate
      required: false,
      default: '',
      trim: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },
    sections: [SectionSchema], // Embed sections as an array within the course
  },
  {
    timestamps: true,
  }
);

// Create and export the models
const Course = mongoose.model('Course', CourseSchema);

export { Course };
