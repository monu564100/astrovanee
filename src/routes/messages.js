import { Router } from 'express';
import { pool } from '../db/pool.js';

// create messages table if not exists (simple)
(async function ensureMessages() {
  await pool.query(`CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultationId INT NOT NULL,
    senderId INT NOT NULL,
    body TEXT NOT NULL,
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
})();

const router = Router();

router.get('/:consultationId', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages WHERE consultationId=? ORDER BY id ASC', [req.params.consultationId]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { consultationId, senderId, body } = req.body;
    if (!consultationId || !senderId || !body) return res.status(400).json({ error: 'consultationId, senderId, body required' });
    const [result] = await pool.execute('INSERT INTO messages (consultationId, senderId, body) VALUES (?,?,?)', [consultationId, senderId, body]);
    res.status(201).json({ id: result.insertId });
  } catch (e) { next(e); }
});

export default router;
