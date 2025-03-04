import mongoose, { Schema } from 'mongoose';

export const PlanTypeSchema = new Schema(
  {
    name: {
      type: String,
      enum: ['Student Plan', 'Work Plan', 'Elite Plan', 'Demo1 Plan'], // Plan names
      required: [true, 'Plan name is required'],
      unique: true,
    },
    allowedContent: [
      {
        contentTypeId: {
          type: Schema.Types.ObjectId,
          ref: 'Content', // Reference to the Content model
          required: [true, 'Content ID is required'],
        },
        contentType: {
          type: String,
          enum: ['Pathway', 'Course', 'QuizModule', 'Event', 'Podcast'], // Content types
          required: [true, 'Content type is required'],
        },
      },
    ],
    description: {
      type: String,
      required: false,
      default: '',
    },
    monthlyPrice: {
      type: Number,
      required: [true, 'Monthly price is required'],
      default: 0,
    },
    yearlyPrice: {
      type: Number,
      required: [true, 'Yearly price is required'],
      default: 0,
    },
    isMonthly: {
      type: Boolean,
      required: false,
      default: false,
    },
    isYearly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model('PlanType', PlanTypeSchema);
