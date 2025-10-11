import admin from 'firebase-admin';
import { logger } from '../logger.js';

// Initialize Firebase Admin SDK
// You'll need to add your Firebase service account key
let firebaseInitialized = false;

export function initializeFirebase() {
  if (firebaseInitialized) return;

  try {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountEnv) {
      logger.warn('⚠️  Firebase service account not configured in .env file');
      logger.warn('⚠️  Push notifications will NOT work until configured');
      logger.warn('ℹ️   See ENV_VARIABLES_GUIDE.md for setup instructions');
      return;
    }

    // Try to parse the service account JSON
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountEnv);
    } catch (parseError) {
      logger.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON');
      logger.error('❌ The JSON appears to be malformed. Please check your .env file');
      logger.error('ℹ️  The value should be valid JSON on a single line');
      logger.error('ℹ️  Example: FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}');
      return;
    }

    // Validate required fields
    if (!serviceAccount.type || !serviceAccount.project_id || !serviceAccount.private_key) {
      logger.error('❌ Firebase service account JSON is missing required fields');
      logger.error('ℹ️  Required fields: type, project_id, private_key, client_email');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    logger.info('✅ Firebase Admin SDK initialized successfully');
    logger.info(`✅ Project: ${serviceAccount.project_id}`);
  } catch (error) {
    logger.error('❌ Failed to initialize Firebase:', error.message);
    logger.error('ℹ️  Check your Firebase service account configuration');
  }
}

export async function sendPushNotification(token, notification) {
  if (!firebaseInitialized) {
    logger.warn('⚠️  Firebase not initialized. Cannot send push notification.');
    logger.warn('ℹ️   Configure FIREBASE_SERVICE_ACCOUNT in .env to enable notifications');
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
          priority: 'high',
        },
      },
    };

    const response = await admin.messaging().send(message);
    logger.info(`Push notification sent successfully: ${response}`);
    return response;
  } catch (error) {
    logger.error('Error sending push notification:', error);
    throw error;
  }
}

export async function sendCallNotification(
  token,
  callerName,
  consultationId,
  callerImage
) {
  return sendPushNotification(token, {
    title: 'Incoming Call',
    body: `${callerName} is calling you`,
    imageUrl: callerImage,
    data: {
      type: 'call',
      consultationId: String(consultationId),
      callerName,
    },
  });
}

export async function sendMessageNotification(
  token,
  senderName,
  messageText,
  consultationId,
  senderImage
) {
  return sendPushNotification(token, {
    title: `New message from ${senderName}`,
    body: messageText,
    imageUrl: senderImage,
    data: {
      type: 'message',
      consultationId: String(consultationId),
      senderName,
    },
  });
}

export default {
  initializeFirebase,
  sendPushNotification,
  sendCallNotification,
  sendMessageNotification,
};
