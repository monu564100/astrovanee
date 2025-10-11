import { Router } from 'express';
import { pool } from '../db/pool.js';
import { sendCallNotification, sendMessageNotification } from '../services/firebase.js';
import { 
  sendExpoCallNotification, 
  sendExpoMessageNotification,
  isExpoPushToken 
} from '../services/expo-notifications.js';
import { logger } from '../logger.js';

const router = Router();

// GET /notifications/user/:userId - Check for incoming calls for user
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find consultations where user is involved and status is ongoing
    const [rows] = await pool.query(`
      SELECT c.id, c.consultationstatus, c.vendoracceptedon, v.name as vendorName
      FROM consultation c
      JOIN users v ON c.vendorid = v.id
      WHERE c.userid = ? AND c.consultationstatus = 'ongoing'
      ORDER BY c.vendoracceptedon DESC
      LIMIT 5
    `, [userId]);
    
    const incomingCalls = rows.map(row => ({
      consultationId: row.id,
      vendorName: row.vendorName,
      startedAt: row.vendoracceptedon,
      status: row.consultationstatus
    }));
    
    res.json({ incomingCalls });
  } catch (e) { 
    next(e); 
  }
});

// GET /notifications/vendor/:vendorId - Check call status for vendor
router.get('/vendor/:vendorId', async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    
    // Find active consultations for this vendor
    const [rows] = await pool.query(`
      SELECT c.id, c.consultationstatus, c.vendoracceptedon, u.name as userName
      FROM consultation c
      LEFT JOIN users u ON c.userid = u.id
      WHERE c.vendorid = ? AND c.consultationstatus IN ('ongoing', 'chatting')
      ORDER BY c.vendoracceptedon DESC
      LIMIT 5
    `, [vendorId]);
    
    const activeCalls = rows.map(row => ({
      consultationId: row.id,
      userName: row.userName,
      status: row.consultationstatus,
      startedAt: row.vendoracceptedon
    }));
    
    res.json({ activeCalls });
  } catch (e) { 
    next(e); 
  }
});

// POST /notifications/register-token - Register FCM token for user or vendor
router.post('/register-token', async (req, res, next) => {
  try {
    const { token, userId, vendorId, userType } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    if (!userId && !vendorId) {
      return res.status(400).json({ error: 'Either userId or vendorId is required' });
    }

    const id = vendorId || userId;

    await pool.execute(
      `UPDATE users SET fcm_token = ?, fcm_token_updated_at = NOW() WHERE id = ?`,
      [token, id]
    );

    logger.info(`FCM token registered for user ID: ${id}`);
    res.json({ success: true, message: 'FCM token registered successfully' });
  } catch (e) {
    logger.error('Error registering FCM token:', e);
    next(e);
  }
});

// POST /notifications/send-call - Send call notification
router.post('/send-call', async (req, res, next) => {
  try {
    const { recipientId, recipientType, callerName, consultationId, callerImage, callerId } = req.body;

    if (!recipientId || !recipientType || !callerName || !consultationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // CRITICAL: Prevent sending notification to self
    if (callerId && callerId === recipientId) {
      logger.warn(`⚠️ Prevented sending notification to self (caller ID: ${callerId})`);
      return res.json({ success: false, message: 'Cannot send notification to self' });
    }

    // Get recipient's FCM token
    const [rows] = await pool.query(
      `SELECT fcm_token FROM users WHERE id = ?`,
      [recipientId]
    );

    if (!rows.length || !rows[0].fcm_token) {
      logger.warn(`No FCM token found for user ID: ${recipientId}`);
      return res.json({ success: false, message: 'Recipient has no FCM token' });
    }

    const token = rows[0].fcm_token;
    
    // Use Expo Push Service for Expo tokens, Firebase for FCM tokens
    if (isExpoPushToken(token)) {
      logger.info('📱 Sending via Expo Push Service');
      await sendExpoCallNotification(token, callerName, consultationId);
    } else {
      logger.info('🔥 Sending via Firebase FCM');
      await sendCallNotification(token, callerName, consultationId, callerImage);
    }

    res.json({ success: true, message: 'Call notification sent successfully' });
  } catch (e) {
    logger.error('Error sending call notification:', e);
    next(e);
  }
});

// POST /notifications/send-message - Send message notification
router.post('/send-message', async (req, res, next) => {
  try {
    const { recipientId, recipientType, senderName, messageText, consultationId, senderImage, senderId } = req.body;

    if (!recipientId || !recipientType || !senderName || !messageText || !consultationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // CRITICAL: Prevent sending notification to self
    if (senderId && senderId === recipientId) {
      logger.warn(`⚠️ Prevented sending message notification to self (sender ID: ${senderId})`);
      return res.json({ success: false, message: 'Cannot send notification to self' });
    }

    // Get recipient's FCM token
    const [rows] = await pool.query(
      `SELECT fcm_token FROM users WHERE id = ?`,
      [recipientId]
    );

    if (!rows.length || !rows[0].fcm_token) {
      logger.warn(`No FCM token found for user ID: ${recipientId}`);
      return res.json({ success: false, message: 'Recipient has no FCM token' });
    }

    const token = rows[0].fcm_token;
    
    // Use Expo Push Service for Expo tokens, Firebase for FCM tokens
    if (isExpoPushToken(token)) {
      logger.info('📱 Sending via Expo Push Service');
      await sendExpoMessageNotification(token, senderName, messageText, consultationId);
    } else {
      logger.info('🔥 Sending via Firebase FCM');
      await sendMessageNotification(token, senderName, messageText, consultationId, senderImage);
    }

    res.json({ success: true, message: 'Message notification sent successfully' });
  } catch (e) {
    logger.error('Error sending message notification:', e);
    next(e);
  }
});

export default router;