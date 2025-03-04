import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    razorpay_order_id: {
      type: String,
      required: true,
      default: '',
      // unique: false,
    },
    razorpay_payment_id: {
      type: String,
      required: false,
      default: '',
      // unique: false,
    },
    razorpay_signature: {
      type: String,
      required: false,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
    paymentStatus: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    failureReason: {
      type: String,
      default: '',
    },
    paymentType: {
      type: String,
      enum: ['individual', 'subscription'],
      required: true,
    },
    contentDetails: {
      contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
        required: function () {
          return this.paymentType === 'individual';
        },
      },
      contentType: {
        type: String,
        enum: ['Pathway', 'Course', 'QuizModule', 'Event', 'Podcast'],
        required: function () {
          return this.paymentType === 'individual';
        },
      },
    },
    subscriptionDetails: {
      planTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlanType',
        required: function () {
          return this.paymentType === 'subscription';
        },
      },
      duration: {
        type: String,
        enum: ['monthly', 'yearly', 'inactive'],
        required: function () {
          return this.paymentType === 'subscription';
        },
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
      },
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
