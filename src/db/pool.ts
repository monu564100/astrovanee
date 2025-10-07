import mysql from 'mysql2/promise';
import { logger } from '../logger.js';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'astro',
  connectionLimit: 10,
  timezone: 'Z'
});

export async function ping() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    logger.info('DB ping ok');
  } finally {
    conn.release();
  }
}
