import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

async function runMigration() {
  console.log('🔄 Starting FCM token migration...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('📝 Executing SQL migration...');
    
    // Add columns to users table (includes vendors since they're in the same table)
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN fcm_token VARCHAR(500) NULL,
        ADD COLUMN fcm_token_updated_at TIMESTAMP NULL
      `);
      console.log('✅ Added FCM columns to users table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  FCM columns already exist in users table');
      } else {
        throw error;
      }
    }
    
    // Create index on users table
    try {
      await connection.query('CREATE INDEX idx_users_fcm_token ON users(fcm_token)');
      console.log('✅ Created index on users.fcm_token');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Index already exists on users.fcm_token');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...');
    
    const [userColumns] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'fcm_token%'"
    );
    
    console.log('\nUsers table FCM columns (used for both users and vendors):');
    console.table(userColumns);
    
    // Check indexes
    const [indexes] = await connection.query(
      "SHOW INDEX FROM users WHERE Key_name = 'idx_users_fcm_token'"
    );
    
    if (indexes.length > 0) {
      console.log('\n✅ Index on fcm_token exists');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
