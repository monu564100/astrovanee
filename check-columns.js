// Check actual table structure on VPS
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function checkTableStructure() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306
    });

    console.log('✅ Connected to MySQL!\n');

    // Check consultation table structure
    console.log('📋 Consultation table columns:');
    const [columns] = await connection.query('DESCRIBE consultation');
    console.table(columns.map(col => ({ 
      Field: col.Field, 
      Type: col.Type, 
      Null: col.Null, 
      Key: col.Key 
    })));

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTableStructure();
