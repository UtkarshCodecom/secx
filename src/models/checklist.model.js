import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    ProgramName: {
      type: String,
      required: true,
    },
    BugName: {
      type: String,
      required: true,
    },
    Status: {
      type: String,
      default: 'Pending',
    },
    Date: {
      type: Date,
      default: Date.now,
    },
    },
    {timestamps: false} // disable timestamps for tasks
);

const checklistSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Ensure one checklist document per user
    },
    tasks: [taskSchema], // Array of tasks
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export const Checklist = mongoose.model('Checklist', checklistSchema);
