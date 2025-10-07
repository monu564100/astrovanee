// Quick test to verify MySQL connection and tables
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function testConnection() {
  console.log('🔍 Testing MySQL Connection...\n');
  console.log('Configuration:');
  console.log('  Host:', process.env.DB_HOST);
  console.log('  User:', process.env.DB_USER);
  console.log('  Database:', process.env.DB_NAME);
  console.log('  Port: 3306\n');

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306
    });

    console.log('✅ Connected to MySQL!\n');

    // Test 1: Show tables
    console.log('📋 Tables in database:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    console.log('');

    // Test 2: Check users
    console.log('👥 Users:');
    const [users] = await connection.query('SELECT id, name, role FROM users LIMIT 5');
    console.table(users);

    // Test 3: Check consultation table
    console.log('📞 Consultations:');
    const [consultations] = await connection.query(
      'SELECT id, customerid, vendorid, consultationstatus, channelName FROM consultation LIMIT 5'
    );
    console.table(consultations);

    // Test 4: Check messages
    console.log('💬 Messages count:');
    const [msgCount] = await connection.query('SELECT COUNT(*) as count FROM messages');
    console.log('  Total messages:', msgCount[0].count);
    console.log('');

    // Test 5: Specific consultation (420)
    console.log('🎯 Testing consultation #420:');
    const [consult420] = await connection.query(
      'SELECT id, customerid, vendorid, consultationstatus FROM consultation WHERE id = 420'
    );
    if (consult420.length > 0) {
      console.log('  ✅ Found:', consult420[0]);
    } else {
      console.log('  ⚠️  Consultation #420 not found. Creating it...');
      await connection.execute(
        `INSERT INTO consultation (id, customerid, vendorid, consultationstatus, category, bookingdate, 
         name, phone, birthdate, birthtime, birthplace, age, gender, lookingfor, preference, timing, 
         price, transactionid, paymentstatus, remaining_time, channelName) 
         VALUES (420, 1, 2, 'pending', 'general', NOW(), 'Test User', '1234567890', '1990-01-01', 
         '12:00:00', 'Test City', 35, 'male', 'Career guidance', 'Video call', 'Evening', 500.00, 
         'TXN123456', 'completed', 300, 'c_420')`
      );
      console.log('  ✅ Consultation #420 created');
    }

    await connection.end();
    console.log('\n✅ All tests passed! Database is ready.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if MySQL is running on VPS');
    console.error('2. Verify credentials in .env file');
    console.error('3. Check firewall allows port 3306');
    console.error('4. Ensure MySQL bind-address = 0.0.0.0');
    console.error('5. Run: GRANT ALL PRIVILEGES ON astro.* TO "astro_user"@"%" IDENTIFIED BY "Astro@123";');
    process.exit(1);
  }
}

testConnection();
