import mongoose, { Schema } from "mongoose";

const UserDetailSchema = new Schema(
  {
    fullname: { type: String, required: true },
    profileImage: {
      type: String,
      default: 'https://avatar.iran.liara.run/public/boy?username=Ash',
    },
    phoneNumber: { type: String }, // Phone number
    isOnboarded: { type: Boolean, default: false }, // Onboarding status
    city: { type: String, default: '' }, // City
    state: { type: String, default: '' }, // State
    country: { type: String, default: '' }, // Country
  },
  { timestamps: true }
);

export const UserDetail = mongoose.model('UserDetail', UserDetailSchema);
