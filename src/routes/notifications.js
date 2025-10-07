import { Router } from 'express';
import { pool } from '../db/pool.js';

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

export default router;