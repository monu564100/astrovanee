import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '160.250.204.143',
  user: 'astro_user',
  password: 'Astro@123',
  database: 'astro',
  port: 3306
});

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ Connected:', rows);
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
})();
