import { Router } from 'express';
import { pool } from '../db/pool.js';
import { scheduleCallEnd } from '../services/callScheduler.js';

const router = Router();

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM consultation WHERE id=?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (e) { next(e); }
});

router.post('/start-chat', async (req, res, next) => {
  try {
    const { consultationId } = req.body;
    if (!consultationId) return res.status(400).json({ error: 'consultationId required' });
    await pool.execute("UPDATE consultation SET consultationstatus='chatting' WHERE id=?", [consultationId]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Create or ensure consultation exists
router.post('/create', async (req, res, next) => {
  try {
    const { vendorId, userId, category = 'general' } = req.body;
    if (!vendorId) return res.status(400).json({ error: 'vendorId required' });
    
    // Create a new consultation
    const [result] = await pool.execute(
      "INSERT INTO consultation (customerid, vendorid, consultationstatus, category, bookingdate, name, phone, birthdate, birthtime, birthplace, age, gender, lookingfor, preference, timing, price, transactionid, paymentstatus, vendoraction, vendoracceptedon, customeraction, customeracceptedon, endedon, endedby, remaining_time, settled, merchantuserid, latitude, longitude, vendorreminder, customerreminder, uid, calltoken, channelName) VALUES (?, ?, 'pending', ?, NOW(), 'Test User', '1234567890', '1990-01-01', '12:00', 'Test City', '30', 'Other', 'consultation', 'video', 'anytime', '100', 'test_tx', 'pending', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '')",
      [userId || 1, vendorId, category]
    );
    
    res.json({ consultationId: result.insertId, status: 'created' });
  } catch (e) { next(e); }
});

router.post('/start-call', async (req, res, next) => {
  try {
    const { consultationId, vendorId } = req.body;
    if (!consultationId || !vendorId) return res.status(400).json({ error: 'consultationId & vendorId required' });
    
    console.log('🔵 Starting call for consultation:', consultationId, 'vendor:', vendorId);
    
    const [rows] = await pool.query('SELECT id, customerid, vendorid, consultationstatus FROM consultation WHERE id=?', [consultationId]);
    
    if (!rows.length) {
      // Create consultation if it doesn't exist
      console.log('📝 Creating new consultation:', consultationId, 'for vendor:', vendorId);
      await pool.execute(
        "INSERT INTO consultation (id, customerid, vendorid, consultationstatus, category, bookingdate, name, phone, birthdate, birthtime, birthplace, age, gender, lookingfor, preference, timing, price, transactionid, paymentstatus, vendoraction, vendoracceptedon, customeraction, customeracceptedon, endedon, endedby, remaining_time, settled, merchantuserid, latitude, longitude, vendorreminder, customerreminder, uid, calltoken, channelName) VALUES (?, ?, ?, 'pending', 'general', NOW(), 'Test User', '1234567890', '1990-01-01', '12:00', 'Test City', '30', 'Other', 'consultation', 'video', 'anytime', '100', 'test_tx', 'pending', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '')",
        [consultationId, 1, vendorId]
      );
    } else {
      // Log current consultation state
      console.log('📋 Existing consultation:', {
        id: rows[0].id,
        customerid: rows[0].customerid,
        vendorid: rows[0].vendorid,
        status: rows[0].consultationstatus,
        requestedVendorId: vendorId
      });
      
      // Check if vendor matches (or if vendorid is null, assign it)
      if (rows[0].vendorid && String(rows[0].vendorid) !== String(vendorId)) {
        console.error('❌ Vendor mismatch! Expected:', rows[0].vendorid, 'Got:', vendorId);
        return res.status(403).json({ 
          error: 'vendor mismatch',
          expected: rows[0].vendorid,
          received: vendorId
        });
      }
      
      // If vendorid is null, update it
      if (!rows[0].vendorid) {
        console.log('🔄 Setting vendor ID to:', vendorId);
        await pool.execute("UPDATE consultation SET vendorid=? WHERE id=?", [vendorId, consultationId]);
      }
    }
    
    const startedAt = Date.now();
    const mysqlDateTime = new Date(startedAt).toISOString().slice(0, 19).replace('T', ' ');
    await pool.execute("UPDATE consultation SET consultationstatus='ongoing', vendoracceptedon=? WHERE id=?", [mysqlDateTime, consultationId]);
    await scheduleCallEnd(consultationId, startedAt);
    
    console.log('✅ Call started successfully for consultation:', consultationId);
    res.json({ ok: true, startedAt, channelName: `c_${consultationId}` });
  } catch (e) { 
    console.error('❌ Start call error:', e);
    next(e); 
  }
});

router.post('/end', async (req, res, next) => {
  try {
    const { consultationId, endedBy } = req.body;
    if (!consultationId) return res.status(400).json({ error: 'consultationId required' });
    const mysqlDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await pool.execute("UPDATE consultation SET consultationstatus='ended', endedon=?, endedby=? WHERE id=?", [mysqlDateTime, endedBy || 'system', consultationId]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/decline-call', async (req, res, next) => {
  try {
    const { consultationId, userId } = req.body;
    if (!consultationId) return res.status(400).json({ error: 'consultationId required' });
    
    console.log('❌ User declined call for consultation:', consultationId);
    
    // Update consultation status to declined
    const mysqlDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await pool.execute(
      "UPDATE consultation SET consultationstatus='declined', endedon=?, endedby=? WHERE id=?", 
      [mysqlDateTime, userId || 'user', consultationId]
    );
    
    res.json({ ok: true, message: 'Call declined' });
  } catch (e) { 
    console.error('❌ Decline call error:', e);
    next(e); 
  }
});

export default router;
