// Test script to verify notification system is working
// Run: node Backend/test-notifications.js

import { pool } from './src/db/pool.js';
import { sendCallNotification, sendMessageNotification } from './src/services/firebase.js';
import { logger } from './src/logger.js';

async function testNotifications() {
  console.log('🧪 Testing Notification System\n');

  try {
    // Test 1: Check database connection
    console.log('1️⃣ Testing Database Connection...');
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('✅ Database connected\n');

    // Test 2: Check FCM tokens in database
    console.log('2️⃣ Checking FCM Tokens...');
    const [users] = await pool.query(`
      SELECT id, name, role, fcm_token, fcm_token_updated_at 
      FROM users 
      WHERE fcm_token IS NOT NULL 
      LIMIT 5
    `);
    
    if (users.length === 0) {
      console.log('⚠️  No users have FCM tokens registered');
      console.log('   Run the app and grant notification permission first\n');
    } else {
      console.log(`✅ Found ${users.length} user(s) with FCM tokens:`);
      users.forEach(user => {
        console.log(`   - ${user.name} (ID: ${user.id}, Role: ${user.role})`);
        console.log(`     Token: ${user.fcm_token.substring(0, 30)}...`);
        console.log(`     Updated: ${user.fcm_token_updated_at}\n`);
      });
    }

    // Test 3: Send test notification (if token exists)
    if (users.length > 0) {
      const testUser = users[0];
      console.log('3️⃣ Sending Test Notification...');
      console.log(`   Recipient: ${testUser.name} (ID: ${testUser.id})`);
      
      try {
        await sendMessageNotification(
          testUser.fcm_token,
          'Test Sender',
          'This is a test notification from the backend! 🎉',
          999, // Test consultation ID
          null // No image
        );
        console.log('✅ Test notification sent successfully!');
        console.log('   Check your device for the notification\n');
      } catch (notifError) {
        console.error('❌ Failed to send notification:', notifError.message);
        console.log('   Check Firebase configuration in .env file\n');
      }
    }

    // Test 4: Check consultation data
    console.log('4️⃣ Checking Consultations...');
    const [consultations] = await pool.query(`
      SELECT c.id, c.consultationstatus, c.vendorid, c.userid,
             u.name as user_name, v.name as vendor_name
      FROM consultation c
      LEFT JOIN users u ON c.userid = u.id
      LEFT JOIN users v ON c.vendorid = v.id
      WHERE c.consultationstatus IN ('chatting', 'ongoing')
      LIMIT 3
    `);
    
    if (consultations.length === 0) {
      console.log('⚠️  No active consultations found');
    } else {
      console.log(`✅ Found ${consultations.length} active consultation(s):`);
      consultations.forEach(c => {
        console.log(`   - Consultation #${c.id}`);
        console.log(`     User: ${c.user_name} (ID: ${c.userid})`);
        console.log(`     Vendor: ${c.vendor_name} (ID: ${c.vendorid})`);
        console.log(`     Status: ${c.consultationstatus}\n`);
      });
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Test Summary:');
    console.log(`   ✅ Database: Connected`);
    console.log(`   ${users.length > 0 ? '✅' : '⚠️'}  FCM Tokens: ${users.length} registered`);
    console.log(`   ${consultations.length > 0 ? '✅' : '⚠️'}  Consultations: ${consultations.length} active`);
    
    if (users.length === 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   1. Open the app on your device');
      console.log('   2. Grant notification permission');
      console.log('   3. Login as user or vendor');
      console.log('   4. Run this test again\n');
    } else {
      console.log('\n✅ Notification system is ready!');
      console.log('   You can now test:');
      console.log('   - Send a message in chat');
      console.log('   - Start a call as vendor');
      console.log('   - Notifications should appear on recipient device\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testNotifications();
