import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Define the schema
// const UserSchema = new Schema(
//   {
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     profileImage: {
//       type: String,
//       default: 'https://avatar.iran.liara.run/public/boy?username=Ash',
//     },
//     provider: { type: String, enum: ['google', 'email'], required: true },
//     userDetails: {
//       fullname: { type: String, required: true },
//       phoneNumber: { type: String, required: false }, // Phone number
//       isPremium: { type: Boolean, default: false }, // Premium user flag
//       isOnboarded: { type: Boolean, default: false }, // Onboarding status
//       city: { type: String, required: false }, // City and state
//       State: { type: String, required: false }, // City and state
//       country: { type: String, required: false }, // Country
//     },
//   },
//   { timestamps: true }
// );

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    provider: { type: String, enum: ['google', 'email'], required: true },
    isPremium: { type: Boolean, default: false }, // Lifetime Premium flag
    userDetails: { type: Schema.Types.ObjectId, ref: 'UserDetail' }, // Reference to UserDetail model
    subscription: [{ type: Schema.Types.ObjectId, ref: 'Subscription' }], // Reference to Subscription model
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet' }, // Reference to Wallet model,
    referralCode: {
      type: String,
      unique: true,
      // default: () => uuidv4().substring(0, 8).toUpperCase(), // Generate 8 char unique code
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    referralUsers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

// Pre-save middleware for password hashing
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error('Password not set');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
