import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    totalSlots: {
      type: Number,
      required: true,
    },
    remainingSlots: {
      type: Number,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      // required: true,
    },
    footerImageUrl: {
      type: String,
      // required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String, // e.g., "4pm - 12pm"
      required: true,
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
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Pre-save middleware to set remainingSlots if not provided
eventSchema.pre('save', function (next) {
  if (this.isNew && this.remainingSlots === undefined) {
    this.remainingSlots = this.totalSlots;
  }
  next();
});

export const Event = mongoose.model('Event', eventSchema);
