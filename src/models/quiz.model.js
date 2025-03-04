import mongoose, { Schema } from 'mongoose';

// Question Schema
const QuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answerOptions: {
      type: [String],
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Quiz Schema
const QuizSchema = new Schema(
  {
    quizName: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    certificate: {
      type: String, // Optional
    },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

// Section Schema
const SectionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    numberOfQuizzes: {
      type: Number,
      required: true,
    },
    hugeIconName: {
      type: String,
    },
    quizzes: [QuizSchema],
  },
  { timestamps: true }
);

// Quiz Module Schema (Top Level)
const QuizModuleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    certificateURL: {
      type: String, // Could be a URL or a string identifier for the certificate
      required: false,
      default: '',
      trim: true,
    },
    sections: [SectionSchema],
    isFree: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Exporting the Model
export const QuizModule = mongoose.model('QuizModule', QuizModuleSchema);