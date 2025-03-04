import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { FCMToken } from '../models/fcmtoken.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../utils/secx-service-account.json'), 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const sendNotification = async (userId, title, body, data = {}) => {
  try {
    // Get user's FCM tokens
    const userToken = await FCMToken.findOne({
      userId,
      isActive: true,
    });

    if (!userToken) {
      console.log('No active FCM tokens found for user:', userId);
      return false;
    }

    const registrationToken = userToken.token;

    // Construct the message payload
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data, // Spread the provided data
        // You can add default values if needed
        timestamp: Date.now().toString(),
      },
      token: registrationToken,
    };

    // Send notification
    try {
      const response = await admin.messaging().send(message);
      console.log('Notification sent successfully:', response);
      return true;
    } catch (firebaseError) {
      if (
        firebaseError.code === 'messaging/registration-token-not-registered'
      ) {
        console.error('Invalid FCM token detected, marking it as inactive.');
        await FCMToken.updateOne({ _id: userToken._id }, { isActive: false });
      } else if (firebaseError.code === 'messaging/mismatched-credential') {
        console.error(
          'SenderId mismatch. Please check Firebase configuration.'
        );
        // Log the current project configuration for debugging
        // console.error('Current project ID:', admin.app());
      } else {
        console.error('Error sending notification:', firebaseError);
      }
      return false;
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Send notification to all users
export const sendNotificationToAllUsers = async (
  title,
  body,
  data = {},
  premiumOnly = false
) => {
  try {
    // Build query based on premiumOnly flag
    const query = { isActive: true };

    // If premiumOnly is true, only get tokens of premium users
    if (premiumOnly) {
      query['userId'] = {
        $in: await User.find({ isPremium: true }).distinct('_id'),
      };
    }

    // Retrieve FCM tokens based on the query
    const userTokens = await FCMToken.find(query);

    if (!userTokens.length) {
      console.log(
        premiumOnly
          ? 'No active FCM tokens found for premium users.'
          : 'No active FCM tokens found.'
      );
      return false;
    }

    let successCount = 0;
    let failureCount = 0;

    // Iterate through each user's token and send the notification
    for (const userToken of userTokens) {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: Date.now().toString(),
          premiumOnly: premiumOnly.toString(), // Add flag to notification data
        },
        token: userToken.token,
      };

      try {
        const response = await admin.messaging().send(message);
        console.log(
          `Notification sent successfully to ${userToken.userId}:`,
          response
        );
        successCount++;
      } catch (firebaseError) {
        console.error(
          `Error sending notification to ${userToken.userId}:`,
          firebaseError
        );

        if (
          firebaseError.code === 'messaging/registration-token-not-registered'
        ) {
          console.error(
            `Invalid FCM token for user ${userToken.userId}, marking it as inactive.`
          );
          await FCMToken.updateOne({ _id: userToken._id }, { isActive: false });
        } else if (firebaseError.code === 'messaging/mismatched-credential') {
          console.error(
            'SenderId mismatch. Please check Firebase configuration.'
          );
        }
        failureCount++;
      }
    }

    console.log(
      `Notification process completed: ${successCount} succeeded, ${failureCount} failed.`,
      premiumOnly ? '(Premium users only)' : '(All users)'
    );

    return {
      successCount,
      failureCount,
      targetAudience: premiumOnly ? 'premium' : 'all',
    };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return false;
  }
};

// export const sendNotificationToAllUsers = async (
//   title,
//   body,
//   data = {},
//   premiumOnly = false
// ) => {
//   try {
//     let userTokens = [];

//     if (premiumOnly) {
//       // Fetch all premium user IDs
//       const premiumUserIds = await User.find({ isPremium: true }).distinct(
//         '_id'
//       );

//       // Loop through premium users to fetch their active FCM tokens
//       for (const userId of premiumUserIds) {
//         const tokens = await FCMToken.find({ isActive: true, userId });
//         userTokens = userTokens.concat(tokens);
//       }
//     } else {
//       // Fetch all active FCM tokens
//       userTokens = await FCMToken.find({ isActive: true });
//     }

//     if (!userTokens.length) {
//       console.log(
//         premiumOnly
//           ? 'No active FCM tokens found for premium users.'
//           : 'No active FCM tokens found.'
//       );
//       return false;
//     }

//     let successCount = 0;
//     let failureCount = 0;

//     // Iterate through each user's token and send the notification
//     for (const userToken of userTokens) {
//       const message = {
//         notification: {
//           title,
//           body,
//         },
//         data: {
//           ...data,
//           timestamp: Date.now().toString(),
//           premiumOnly: premiumOnly.toString(), // Add flag to notification data
//         },
//         token: userToken.token,
//       };

//       try {
//         const response = await admin.messaging().send(message);
//         console.log(
//           `Notification sent successfully to ${userToken.userId}:`,
//           response
//         );
//         successCount++;
//       } catch (firebaseError) {
//         console.error(
//           `Error sending notification to ${userToken.userId}:`,
//           firebaseError
//         );

//         if (
//           firebaseError.code === 'messaging/registration-token-not-registered'
//         ) {
//           console.error(
//             `Invalid FCM token for user ${userToken.userId}, marking it as inactive.`
//           );
//           await FCMToken.updateOne({ _id: userToken._id }, { isActive: false });
//         } else if (firebaseError.code === 'messaging/mismatched-credential') {
//           console.error(
//             'SenderId mismatch. Please check Firebase configuration.'
//           );
//         }
//         failureCount++;
//       }
//     }

//     console.log(
//       `Notification process completed: ${successCount} succeeded, ${failureCount} failed.`,
//       premiumOnly ? '(Premium users only)' : '(All users)'
//     );

//     return {
//       successCount,
//       failureCount,
//       targetAudience: premiumOnly ? 'premium' : 'all',
//     };
//   } catch (error) {
//     console.error('Error sending notifications:', error);
//     return false;
//   }
// };
