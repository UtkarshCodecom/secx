import mongoose, { Schema } from 'mongoose';

const SubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
    plan: {
      type: {
        type: Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: false, // Reference to the SubscriptionPlan model
      },
      startDate: { type: Date, required: false }, // Start date for the plan
      endDate: { type: Date, required: false }, // End date for the plan
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'inactive'],
        default: 'inactive',
      },
    },
    individualSubscriptions: [
      {
        contentType: {
          type: String,
          enum: ['Pathway', 'Course', 'QuizModule', 'Event', 'Podcast'], // Content types
          required: true,
        },
        contentId: {
          type: Schema.Types.ObjectId, // Reference to specific content
          required: true,
          refPath: 'individualSubscriptions.contentType', // dynamic refPath
        },
        startDate: { type: Date, required: true, default: Date.now },
        endDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ['active', 'expired', 'cancelled', 'inactive'],
          default: 'inactive',
        },
      },
    ],
    grantedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add an index for better query performance
SubscriptionSchema.index({ user: 1, 'individualSubscriptions.contentId': 1 });

export const Subscription = mongoose.model('Subscription', SubscriptionSchema);