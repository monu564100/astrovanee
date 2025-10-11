// Add vendor fields to users table
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function addVendorFields() {
  console.log('🔧 Adding vendor fields to users table...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306
    });

    console.log('✅ Connected to MySQL\n');

    // Check which columns already exist
    const [columns] = await connection.query("SHOW COLUMNS FROM users");
    const existingColumns = columns.map(col => col.Field);
    console.log('📋 Existing columns:', existingColumns.join(', '), '\n');

    // Add vendor-specific columns
    const alterQueries = [
      { col: 'photo', query: "ALTER TABLE users ADD COLUMN photo VARCHAR(512) AFTER avatar_url" },
      { col: 'gender', query: "ALTER TABLE users ADD COLUMN gender ENUM('male', 'female', 'other') AFTER photo" },
      { col: 'language', query: "ALTER TABLE users ADD COLUMN language VARCHAR(100) AFTER gender" },
      { col: 'rating', query: "ALTER TABLE users ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00 AFTER language" },
      { col: 'priceperminute', query: "ALTER TABLE users ADD COLUMN priceperminute DECIMAL(10,2) DEFAULT 0.00 AFTER rating" },
      { col: 'chatstatus', query: "ALTER TABLE users ADD COLUMN chatstatus ENUM('available', 'busy', 'offline') DEFAULT 'available' AFTER priceperminute" },
      { col: 'callstatus', query: "ALTER TABLE users ADD COLUMN callstatus ENUM('available', 'busy', 'offline') DEFAULT 'available' AFTER chatstatus" },
      { col: 'status', query: "ALTER TABLE users ADD COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' AFTER callstatus" }
    ];

    for (const { col, query } of alterQueries) {
      if (existingColumns.includes(col)) {
        console.log(`⚠ Column '${col}' already exists, skipping...`);
      } else {
        try {
          await connection.query(query);
          console.log(`✓ Added column: ${col}`);
        } catch (err) {
          console.error(`❌ Error adding ${col}:`, err.message);
        }
      }
    }

    console.log('\n📝 Updating vendor sample data...');
    
    // Update existing vendor with sample data
    await connection.query(`
      UPDATE users 
      SET 
        photo = 'https://i.pravatar.cc/200?img=12',
        gender = 'male',
        language = 'Hindi, English',
        rating = 4.85,
        priceperminute = 25.00,
        chatstatus = 'available',
        callstatus = 'available',
        status = 'active'
      WHERE id = 2 AND role = 'vendor'
    `);
    
    console.log('✓ Sample vendor data updated\n');

    // Verify the changes
    console.log('🔍 Verifying vendor data:');
    const [vendors] = await connection.query(
      'SELECT id, name, role, photo, gender, language, rating, priceperminute, chatstatus, callstatus, status FROM users WHERE role = ?',
      ['vendor']
    );
    console.table(vendors);

    await connection.end();
    console.log('✅ All vendor fields added successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addVendorFields();
