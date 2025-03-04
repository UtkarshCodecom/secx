// models/appConfig.model.js
import mongoose from 'mongoose';

const socialLinksSchema = new mongoose.Schema({
  facebook: { type: String, trim: true },
  twitter: { type: String, trim: true },
  instagram: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  youtube: { type: String, trim: true },
});

const contactInfoSchema = new mongoose.Schema({
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  supportEmail: { type: String, trim: true },
  businessHours: { type: String, trim: true },
});

const legalPagesSchema = new mongoose.Schema({
  termsAndConditions: {
    title: { type: String, default: 'Terms and Conditions' },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  privacyPolicy: {
    title: { type: String, default: 'Privacy Policy' },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  deleteAccount: {
    title: { type: String, default: 'Account Deletion Policy' },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  aboutUs: {
    title: { type: String, default: 'About Us' },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  contactUs: {
    title: { type: String, default: 'Contact Us' },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
});

const appConfigSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      required: true,
      trim: true,
    },
    appMode: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'development',
    },
    maintenanceMode: {
      isEnabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: 'We are under maintenance. Please check back later.',
      },
    },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
    },
    socialLinks: socialLinksSchema,
    contactInfo: contactInfoSchema,
    legalPages: legalPagesSchema,
    analytics: {
      googleAnalyticsId: { type: String },
      facebookPixelId: { type: String },
    },
    paymentGateways: {
      razorpay: {
        isEnabled: { type: Boolean, default: false },
        testMode: { type: Boolean, default: true },
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Ensure only one configuration document exists
appConfigSchema.pre('save', async function (next) {
  const count = await this.constructor.countDocuments();
  if (count === 0 || this._id) {
    next();
  } else {
    next(new Error('Only one configuration document can exist'));
  }
});

export const AppConfig = mongoose.model('AppConfig', appConfigSchema);
