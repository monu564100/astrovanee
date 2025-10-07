import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

// GET /users?type=vendor|user  (optional filter)
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT id, name, type, status FROM users';
    const params = [];
    if (type) { sql += ' WHERE type=?'; params.push(type); }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id=?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (e) { next(e); }
});

export default router;
