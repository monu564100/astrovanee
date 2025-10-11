#!/usr/bin/env node
/**
 * Check consultation data to diagnose call issues
 * Run from Backend directory
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

async function checkConsultation() {
  console.log('🔍 Checking Consultation Data for Call System\n');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306
    });

    console.log('✅ Connected to database\n');
    
    // Get all consultations
    console.log('📋 All Consultations:');
    const [consultations] = await connection.query(
      'SELECT id, customerid, vendorid, consultationstatus, channelName, name FROM consultation ORDER BY id DESC LIMIT 10'
    );
    
    if (consultations.length === 0) {
      console.log('❌ No consultations found in database');
      console.log('   Create a consultation first before testing calls\n');
      await connection.end();
      return;
    }
    
    console.table(consultations);
    
    // Check for issues
    console.log('\n🔍 Checking for Issues:\n');
    
    let hasIssues = false;
    
    for (const consult of consultations) {
      console.log(`Consultation #${consult.id}:`);
      
      // Check if customerid is null
      if (!consult.customerid) {
        console.log(`  ❌ customerid is NULL`);
        console.log(`     Fix: UPDATE consultation SET customerid = ACTUAL_USER_ID WHERE id = ${consult.id};`);
        hasIssues = true;
      } else {
        console.log(`  ✅ customerid: ${consult.customerid}`);
        
        // Verify user exists
        const [users] = await connection.query('SELECT id, name, role FROM users WHERE id = ?', [consult.customerid]);
        if (users.length === 0) {
          console.log(`  ❌ User with ID ${consult.customerid} not found in users table`);
          hasIssues = true;
        } else {
          console.log(`  ✅ User exists: ${users[0].name} (${users[0].role})`);
        }
      }
      
      // Check if vendorid is null
      if (!consult.vendorid) {
        console.log(`  ❌ vendorid is NULL`);
        console.log(`     Fix: UPDATE consultation SET vendorid = ACTUAL_VENDOR_ID WHERE id = ${consult.id};`);
        hasIssues = true;
      } else {
        console.log(`  ✅ vendorid: ${consult.vendorid}`);
        
        // Verify vendor exists
        const [vendors] = await connection.query('SELECT id, name, role FROM users WHERE id = ?', [consult.vendorid]);
        if (vendors.length === 0) {
          console.log(`  ❌ Vendor with ID ${consult.vendorid} not found in users table`);
          hasIssues = true;
        } else {
          console.log(`  ✅ Vendor exists: ${vendors[0].name} (${vendors[0].role})`);
        }
      }
      
      console.log('');
    }
    
    if (!hasIssues) {
      console.log('✅ All consultations look good!\n');
    } else {
      console.log('⚠️  Issues found - fix them before testing calls\n');
    }
    
    // Show all users for reference
    console.log('👥 All Users (for reference):');
    const [allUsers] = await connection.query('SELECT id, name, role FROM users ORDER BY role, id');
    console.table(allUsers);
    
    // Suggest fix commands
    if (hasIssues) {
      console.log('\n💡 Quick Fix Commands:\n');
      console.log('-- If you need to create test users:');
      console.log("INSERT INTO users (name, role, phone) VALUES ('Test User', 'user', '1234567890');");
      console.log("INSERT INTO users (name, role, phone) VALUES ('Test Vendor', 'vendor', '0987654321');\n");
      
      console.log('-- Get the user and vendor IDs:');
      console.log("SELECT id, name, role FROM users WHERE role IN ('user', 'vendor');\n");
      
      console.log('-- Update consultation with correct IDs:');
      console.log('UPDATE consultation SET customerid = USER_ID, vendorid = VENDOR_ID WHERE id = CONSULTATION_ID;\n');
    }
    
    console.log('📝 Test Call Flow:\n');
    console.log('1. Backend: npm start (ensure Socket.IO running)');
    console.log('2. User app: Login as user (from users table)');
    console.log('3. Vendor app: Login as vendor (from users table)');
    console.log('4. Vendor app: Navigate to consultation');
    console.log('5. Vendor app: Tap "Start Call"');
    console.log('6. User app: Should see IncomingCallModal');
    console.log('7. User app: Tap "Answer"');
    console.log('8. Both: Should join Agora channel and see/hear each other\n');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nCheck your Backend/.env file:');
    console.error('DB_HOST=160.250.204.143');
    console.error('DB_USER=your_user');
    console.error('DB_PASSWORD=your_password');
    console.error('DB_NAME=astro');
  }
}

checkConsultation();
