import assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

const {
  PORT,
  HOST,
  HOST_URL,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
  JWT_SECRET,
  MONGO_URI,
  EMAIL_USER,
  EMAIL_PASSWORD,
  AWS_SECRETACCESSKEY,
  AWS_ACCESSKEYID,
  AWS_REGION,
  AWS_BUCKET_NAME,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
} = process.env;

// assert(PORT, 'Port is required');
// assert(HOST, 'Host is required');

export default {
  port: PORT,
  host: HOST,
  hostUrl: HOST_URL,
  firebaseConfig: {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
    measurementId: FIREBASE_MEASUREMENT_ID,
  },
  JWT_SECRET: JWT_SECRET,
  ConnectionString: MONGO_URI,
  emailConfig: {
    user: EMAIL_USER,
    password: EMAIL_PASSWORD,
  },
  awsConfig: {
    secretAccessKey: AWS_SECRETACCESSKEY,
    accessKeyId: AWS_ACCESSKEYID,
    region: AWS_REGION,
    bucketName: AWS_BUCKET_NAME,
  },
  razorpayConfig: {
    keyId: RAZORPAY_KEY_ID,
    keySecret: RAZORPAY_KEY_SECRET,
  },
};
