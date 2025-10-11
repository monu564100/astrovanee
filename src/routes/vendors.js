import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

// GET /vendors?status=active&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { status = 'active', limit = 50 } = req.query;
    const [rows] = await pool.query('SELECT id, name, photo, gender, language, rating, priceperminute, chatstatus, callstatus FROM users WHERE role=? AND status=? LIMIT ?', ['vendor', status, Number(limit)]);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /vendors/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id=? AND role=?', [req.params.id, 'vendor']);
    res.json(rows[0] || null);
  } catch (e) { next(e); }
});

// GET /vendors/:id/consultations (recent)
router.get('/:id/consultations', async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM consultation WHERE vendorid=? ORDER BY id DESC LIMIT 25", [req.params.id]);
    res.json(rows);
  } catch (e) { next(e); }
});

export default router;
