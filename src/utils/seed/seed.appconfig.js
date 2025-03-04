import { AppConfig } from '../../models/appconfig.model.js';
import { ApiError } from '../ApiError.js';
import { ApiResponse } from '../ApiResponse.js';

// seeds/appConfig.seed.js
export const defaultAppConfig = {
  appName: 'EduHub',
  appMode: 'development',
  maintenanceMode: {
    isEnabled: false,
    message: 'We are under maintenance. Please check back later.',
  },
  appearance: {
    theme: 'system',
    primaryColor: '#007AFF',
    logoUrl: '/assets/images/logo.png',
    faviconUrl: '/assets/images/favicon.ico',
  },
  seo: {
    metaTitle: 'EduHub - Your Learning Platform',
    metaDescription:
      'EduHub is a comprehensive learning platform offering courses, pathways, quizzes, and more.',
    keywords: [
      'education',
      'online learning',
      'courses',
      'pathways',
      'quizzes',
      'e-learning',
    ],
  },
  //   features: {
  //     enableRegistration: true,
  //     enableSocialLogin: true,
  //     enableEmailVerification: true,
  //     enableTwoFactorAuth: false,
  //   },
  socialLinks: {
    facebook: 'https://facebook.com/eduhub',
    twitter: 'https://twitter.com/eduhub',
    instagram: 'https://instagram.com/eduhub',
    linkedin: 'https://linkedin.com/company/eduhub',
    youtube: 'https://youtube.com/eduhub',
  },
  contactInfo: {
    email: 'info@eduhub.com',
    phone: '+91 9876543210',
    address: '123 Education Street, Learning City - 400001',
    supportEmail: 'support@eduhub.com',
    businessHours: 'Monday to Friday - 9:00 AM to 6:00 PM IST',
  },
  legalPages: {
    termsAndConditions: {
      title: 'Terms and Conditions',
      content: `
# Terms and Conditions

Last Updated: ${new Date().toISOString().split('T')[0]}

## 1. Introduction
Welcome to EduHub. These Terms and Conditions govern your use of our website and services.

## 2. Definitions
- "Platform" refers to EduHub
- "User" refers to any person accessing or using the Platform
- "Content" refers to all materials available on the Platform

## 3. User Obligations
- Users must be at least 13 years old
- Users must provide accurate information
- Users are responsible for maintaining account security

## 4. Intellectual Property
All content on the Platform is protected by copyright and other intellectual property rights.
      `,
      lastUpdated: new Date(),
    },
    privacyPolicy: {
      title: 'Privacy Policy',
      content: `
# Privacy Policy

Last Updated: ${new Date().toISOString().split('T')[0]}

## 1. Information We Collect
- Personal Information
- Usage Data
- Cookies and Tracking Data

## 2. How We Use Your Information
- To provide and maintain our service
- To notify you about changes
- To provide customer support

## 3. Data Security
We implement appropriate security measures to protect your personal information.
      `,
      lastUpdated: new Date(),
    },
    deleteAccount: {
      title: 'Account Deletion Policy',
      content: `
# Account Deletion Policy

Last Updated: ${new Date().toISOString().split('T')[0]}

## Process
1. Request account deletion from settings
2. Confirm deletion request
3. 30-day grace period
4. Permanent deletion

## Data Handling
- What data we delete
- What data we retain
- Legal requirements
      `,
      lastUpdated: new Date(),
    },
    aboutUs: {
      title: 'About Us',
      content: `
# About EduHub

EduHub is a leading educational technology platform committed to making quality education accessible to everyone.

## Our Mission
To transform education through technology and innovation.

## Our Vision
To be the world's most trusted learning platform.

## Our Values
- Excellence in Education
- Innovation
- Accessibility
- Student Success
      `,
      lastUpdated: new Date(),
    },
    contactUs: {
      title: 'Contact Us',
      content: `
# Contact Us

## Get in Touch

We're here to help! Reach out to us through any of these channels:

### Customer Support
Email: support@eduhub.com
Phone: +91 9876543210

### Business Inquiries
Email: business@eduhub.com

### Office Address
123 Education Street
Learning City - 400001
      `,
      lastUpdated: new Date(),
    },
  },
  analytics: {
    googleAnalyticsId: 'G-XXXXXXXXXX',
    facebookPixelId: 'XXXXXXXXXX',
  },
  paymentGateways: {
    razorpay: {
      isEnabled: true,
      testMode: true,
    },
  },
};

// Seeder function
export const seedAppConfig = async (req, res) => {  
  await AppConfig.deleteMany({}); // Delete existing data

  const appconfig = new AppConfig(defaultAppConfig);
  await appconfig.save();

  if (!appconfig) {
    throw new ApiError(500, 'Failed to create AppConfig');
  }

  const response = new ApiResponse(
    201,
    'AppConfig created successfully',
    appconfig
  );
  return res.status(response.statusCode).json(response);
};
