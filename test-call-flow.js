#!/usr/bin/env node
/**
 * Test call flow from vendor to user
 * Run this from Backend directory while both apps are running
 */

console.log('🧪 CALL FLOW TEST SCRIPT\n');
console.log('This script will help you diagnose call flow issues\n');

const baseUrl = process.env.API_BASE || 'http://192.168.1.5:3000';
console.log('API Base:', baseUrl);
console.log('');

async function testCallFlow() {
  console.log('═══════════════════════════════════════════════');
  console.log('STEP 1: Test Database Connection');
  console.log('═══════════════════════════════════════════════\n');
  
  try {
    const dbTest = await import('./test-db.js');
    console.log('✅ Database accessible\n');
  } catch (e) {
    console.error('❌ Database error:', e.message);
    console.log('   Fix: Check Backend/.env database credentials\n');
    return;
  }

  console.log('═══════════════════════════════════════════════');
  console.log('STEP 2: Check Socket.IO Server');
  console.log('═══════════════════════════════════════════════\n');
  
  try {
    const io = await import('socket.io-client');
    const socket = io.default(baseUrl);
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Socket connection timeout'));
      }, 5000);
      
      socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('✅ Socket.IO server running');
        console.log('   Socket ID:', socket.id);
        
        // Test vendor registration
        socket.emit('register_identity', { role: 'vendor', id: 1 });
        console.log('✅ Vendor identity registered (room: vendor:1)');
        
        socket.disconnect();
        resolve();
      });
      
      socket.on('connect_error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
    
    console.log('');
  } catch (e) {
    console.error('❌ Socket.IO error:', e.message);
    console.log('   Fix: Ensure Backend server is running (npm start)\n');
    return;
  }

  console.log('═══════════════════════════════════════════════');
  console.log('STEP 3: Test Agora Token Generation');
  console.log('═══════════════════════════════════════════════\n');
  
  try {
    const response = await fetch(`${baseUrl}/tokens/rtc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consultationId: 1,
        channelName: 'c_1',
        uid: 100001,
        vendorId: 1
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('✅ Agora token generated');
    console.log('   Token length:', data.token?.length || 0);
    console.log('   UID:', data.uid);
    console.log('   Channel:', data.channelName);
    console.log('');
  } catch (e) {
    console.error('❌ Token generation error:', e.message);
    console.log('   Fix: Check AGORA_APP_ID and AGORA_APP_CERTIFICATE in Backend/.env\n');
    return;
  }

  console.log('═══════════════════════════════════════════════');
  console.log('STEP 4: Simulate Call Flow');
  console.log('═══════════════════════════════════════════════\n');
  
  try {
    const io = await import('socket.io-client');
    
    // Create vendor socket
    const vendorSocket = io.default(baseUrl);
    await new Promise(resolve => vendorSocket.on('connect', resolve));
    vendorSocket.emit('register_identity', { role: 'vendor', id: 1 });
    console.log('✅ Vendor socket connected:', vendorSocket.id);
    
    // Create user socket
    const userSocket = io.default(baseUrl);
    await new Promise(resolve => userSocket.on('connect', resolve));
    userSocket.emit('register_identity', { role: 'user', id: 1 });
    console.log('✅ User socket connected:', userSocket.id);
    
    // Wait for registration to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set up user listener
    userSocket.on('incoming_call', (data) => {
      console.log('✅ USER RECEIVED incoming_call event:', data);
    });
    
    // Vendor starts call
    console.log('\n📞 Vendor emitting call_invite...');
    vendorSocket.emit('call_invite', {
      consultationId: 1,
      vendorId: 1,
      userId: 1,
      channelName: 'c_1'
    });
    
    // Wait for event propagation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n✅ Call flow simulation complete');
    
    vendorSocket.disconnect();
    userSocket.disconnect();
    
  } catch (e) {
    console.error('❌ Call flow error:', e.message);
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('TEST COMPLETE');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log('📋 CHECKLIST FOR APP:');
  console.log('   □ Backend server running (npm start in Backend/)');
  console.log('   □ Development client built (npx expo run:android in Frontend/)');
  console.log('   □ App started with --dev-client flag');
  console.log('   □ Vendor app logged in as vendor');
  console.log('   □ User app logged in as user');
  console.log('   □ Both apps show "Socket connected" in logs');
  console.log('   □ Frontend/.env has correct EXPO_PUBLIC_API_BASE');
  console.log('');
  
  console.log('🔍 WHAT TO CHECK IN APP LOGS:');
  console.log('');
  console.log('VENDOR APP (when clicking Start Call):');
  console.log('   1. "📞 START CALL - Step 1: Checking permissions..."');
  console.log('   2. "✅ Permissions granted"');
  console.log('   3. "✅ Fetched user ID from consultation: X"');
  console.log('   4. "✅ Backend call started"');
  console.log('   5. "✅ VENDOR Token received"');
  console.log('   6. "✅ tokenInfo set - Agora will auto-join now"');
  console.log('   7. "📤 Emitting call_invite with data: {...}"');
  console.log('   8. "✅ Socket event emitted"');
  console.log('   9. "✅ Push notification sent successfully"');
  console.log('   10. "✅ START CALL COMPLETE - Waiting for user to join..."');
  console.log('');
  console.log('USER APP (should receive call):');
  console.log('   1. "📞 incoming call consultation X" (from SignalingContext)');
  console.log('   2. IncomingCallModal should appear with Answer/Decline buttons');
  console.log('   3. Clicking Answer → "🚀 Auto-navigating to call screen: X"');
  console.log('   4. "🎯 Auto-joining call from accept..."');
  console.log('   5. "🎫 USER Token received"');
  console.log('   6. "✅ Joined channel successfully"');
  console.log('');
  
  console.log('❌ IF CALLS NOT WORKING:');
  console.log('');
  console.log('Issue: "Socket not connected" in vendor logs');
  console.log('Fix: Check EXPO_PUBLIC_API_BASE in Frontend/.env matches Backend IP');
  console.log('');
  console.log('Issue: User not receiving incoming_call event');
  console.log('Fix: Ensure user app shows "✅ Identity registered" with correct ID');
  console.log('');
  console.log('Issue: "Running in Expo Go - using mock Agora"');
  console.log('Fix: Build development client: npx expo run:android');
  console.log('');
  console.log('Issue: Permissions denied');
  console.log('Fix: Grant camera/microphone in Android settings');
  console.log('');
  console.log('Issue: "Failed to fetch consultation"');
  console.log('Fix: Ensure consultation exists in database with correct customerid');
  console.log('');
}

testCallFlow().catch(console.error);
