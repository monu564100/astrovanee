import { logger } from '../logger.js';
import fetch from 'node-fetch';

/**
 * Send push notification using Expo Push Notification Service
 * This works with Expo Push Tokens (ExponentPushToken[...])
 */
export async function sendExpoPushNotification(expoPushToken, title, body, data = {}) {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
      channelId: data.type === 'call' ? 'calls' : 'messages',
    };

    logger.info(`📤 Sending Expo push notification to: ${expoPushToken.substring(0, 30)}...`);
    logger.info(`   Title: ${title}`);
    logger.info(`   Body: ${body}`);

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data && result.data[0]?.status === 'error') {
      logger.error('❌ Expo push notification error:', result.data[0]);
      throw new Error(result.data[0].message || 'Failed to send notification');
    }

    logger.info('✅ Expo push notification sent successfully');
    return { success: true, result };
  } catch (error) {
    logger.error('❌ Error sending Expo push notification:', error.message);
    throw error;
  }
}

/**
 * Send call notification via Expo Push Service with action buttons
 */
export async function sendExpoCallNotification(
  expoPushToken,
  callerName,
  consultationId
) {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: '📞 Incoming Call',
      body: `${callerName} is calling you`,
      data: {
        type: 'call',
        consultationId: String(consultationId),
        callerName: callerName,
      },
      priority: 'high',
      channelId: 'calls',
      categoryIdentifier: 'call', // Links to notification category with action buttons
    };

    logger.info(`📤 Sending call notification with action buttons to: ${expoPushToken.substring(0, 30)}...`);
    logger.info(`   Caller: ${callerName}`);
    logger.info(`   Consultation ID: ${consultationId}`);

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data && result.data[0]?.status === 'error') {
      logger.error('❌ Expo push notification error:', result.data[0]);
      throw new Error(result.data[0].message || 'Failed to send notification');
    }

    logger.info('✅ Call notification sent successfully with Answer/Decline buttons');
    return { success: true, result };
  } catch (error) {
    logger.error('❌ Error sending call notification:', error.message);
    throw error;
  }
}

/**
 * Send message notification via Expo Push Service
 */
export async function sendExpoMessageNotification(
  expoPushToken,
  senderName,
  messageText,
  consultationId
) {
  // Truncate message preview to 100 characters
  const preview = messageText.length > 100 
    ? messageText.substring(0, 100) + '...' 
    : messageText;

  return sendExpoPushNotification(
    expoPushToken,
    `💬 ${senderName}`,
    preview,
    {
      type: 'message',
      consultationId: String(consultationId),
      senderName: senderName,
    }
  );
}

/**
 * Validate if a token is an Expo Push Token
 */
export function isExpoPushToken(token) {
  return token && (
    token.startsWith('ExponentPushToken[') || 
    token.startsWith('ExpoPushToken[')
  );
}

/**
 * Send notification using the appropriate service based on token type
 */
export async function sendSmartNotification(token, title, body, data = {}) {
  if (!token) {
    throw new Error('No token provided');
  }

  if (isExpoPushToken(token)) {
    logger.info('🔔 Using Expo Push Service (development build)');
    return sendExpoPushNotification(token, title, body, data);
  } else {
    logger.info('🔔 Token appears to be FCM token (production build)');
    // Fall back to Firebase for production FCM tokens
    const firebase = await import('./firebase.js');
    return firebase.sendPushNotification(token, {
      title,
      body,
      data,
    });
  }
}
