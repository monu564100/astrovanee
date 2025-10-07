import { Router } from 'express';
import { pool } from '../db/pool.js';
import { buildRtcToken, buildRtmToken } from '../services/agora.js';
import { scheduleCallEnd } from '../services/callScheduler.js';

const router = Router();

// POST /tokens/rtc { consultationId, channelName }
router.post('/rtc', async (req, res, next) => {
  try {
    const { consultationId, channelName, uid, vendorId } = req.body;
    console.log('Token request:', { consultationId, channelName, uid, vendorId });
    
    if (!consultationId || !channelName) {
      return res.status(400).json({ error: 'consultationId & channelName required' });
    }
    
    // Fetch consultation row with customerid
    const [rows] = await pool.query('SELECT vendorid, customerid, consultationstatus, channelName, calltoken, vendoracceptedon FROM consultation WHERE id=?', [consultationId]);
    if (!rows.length) {
      console.log('Consultation not found, creating:', consultationId);
      // Create consultation if it doesn't exist
      await pool.execute(
        "INSERT INTO consultation (id, customerid, vendorid, consultationstatus, category, bookingdate, name, phone, birthdate, birthtime, birthplace, age, gender, lookingfor, preference, timing, price, transactionid, paymentstatus, vendoraction, vendoracceptedon, customeraction, customeracceptedon, endedon, endedby, remaining_time, settled, merchantuserid, latitude, longitude, vendorreminder, customerreminder, uid, calltoken, channelName) VALUES (?, ?, ?, 'pending', 'general', NOW(), 'Test User', '1234567890', '1990-01-01', '12:00', 'Test City', '30', 'Other', 'consultation', 'video', 'anytime', '100', 'test_tx', 'pending', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '')",
        [consultationId, 1, vendorId || 1]
      );
      const [newRows] = await pool.query('SELECT vendorid, customerid, consultationstatus, channelName, calltoken, vendoracceptedon FROM consultation WHERE id=?', [consultationId]);
      if (!newRows.length) return res.status(500).json({ error: 'Failed to create consultation' });
    }
    
    const row = rows.length ? rows[0] : (await pool.query('SELECT vendorid, customerid, consultationstatus, channelName, calltoken, vendoracceptedon FROM consultation WHERE id=?', [consultationId]))[0][0];
    
    // If vendorId provided (vendor starting or refreshing) enforce match
    if (vendorId != null && String(row.vendorid) !== String(vendorId)) {
      console.log('Vendor mismatch:', { expected: row.vendorid, provided: vendorId });
      return res.status(403).json({ error: 'vendor mismatch' });
    }
    
    const userId = uid || Math.floor(Math.random() * 100000);
    console.log('Generating token for user:', userId, 'channel:', channelName);
    
    const token = buildRtcToken(channelName, userId);
    
    if (row.consultationstatus !== 'ongoing') {
      // Only vendor should be able to transition to ongoing; users must wait
      if (!vendorId) {
        console.log('User trying to join before call started');
        return res.status(409).json({ error: 'call not started' });
      }
      console.log('Updating consultation to ongoing');
      await pool.execute("UPDATE consultation SET consultationstatus='ongoing', channelName=?, calltoken=?, vendoracceptedon=? WHERE id=?", [channelName, token, new Date().toISOString(), consultationId]);
      await scheduleCallEnd(consultationId, Date.now());
    }
    
    console.log('Token generated successfully for consultation:', consultationId);
    // Return vendorId and userId (customerid) so frontend knows which rooms to target
    res.json({ 
      token, 
      uid: userId, 
      channelName, 
      vendorId: row.vendorid, 
      userId: row.customerid 
    });
  } catch (e) { 
    console.error('Token generation error:', e);
    next(e); 
  }
});

router.post('/rtm', async (req, res, next) => {
  try {
    const { account } = req.body;
    if (!account) return res.status(400).json({ error: 'account required' });
    const token = buildRtmToken(account);
    res.json({ token });
  } catch (e) { next(e); }
});

export default router;
