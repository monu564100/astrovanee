import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 Available tables:');
    console.table(tables);
    
    // Check users table structure
    console.log('\n📊 Users table structure:');
    const [userColumns] = await connection.query('DESCRIBE users');
    console.table(userColumns);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTables();
