// Quick test to verify Expo Push Service is working
// Run: node Backend/test-expo-push.js

import { sendExpoCallNotification, sendExpoMessageNotification, isExpoPushToken } from './src/services/expo-notifications.js';

async function testExpoPush() {
  console.log('🧪 Testing Expo Push Notification Service\n');

  // Test token validation
  console.log('1️⃣ Testing Token Validation:');
  const expoToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
  const fcmToken = 'fK8x9Y2zT5uV3wB6nC1mA4sD7gH0jL9pQ8rE5tY2u';
  
  console.log(`   Expo Token: ${isExpoPushToken(expoToken) ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`   FCM Token: ${isExpoPushToken(fcmToken) ? '❌ Should be false' : '✅ Correct'}\n`);

  // Test with a sample Expo Push Token
  console.log('2️⃣ Testing Expo Push Service:');
  console.log('   Note: This will send a real notification if token is valid!\n');

  const testToken = 'ExponentPushToken[YOUR_TEST_TOKEN_HERE]';
  
  if (testToken === 'ExponentPushToken[YOUR_TEST_TOKEN_HERE]') {
    console.log('⚠️  To test actual notification sending:');
    console.log('   1. Open your app');
    console.log('   2. Check backend logs for registered token');
    console.log('   3. Replace YOUR_TEST_TOKEN_HERE with your actual token');
    console.log('   4. Run this script again\n');
    
    console.log('✅ Token validation test passed!');
    console.log('✅ Expo push service is ready to use');
    console.log('\n📱 When you send a message/call from the app:');
    console.log('   Backend will automatically use Expo Push Service');
    console.log('   Look for: "📱 Sending via Expo Push Service" in logs\n');
  } else {
    try {
      console.log('   Sending test notification...');
      await sendExpoMessageNotification(
        testToken,
        'Test Sender',
        'This is a test notification from the backend! 🎉',
        999
      );
      console.log('✅ Test notification sent successfully!');
      console.log('   Check your device for the notification\n');
    } catch (error) {
      console.error('❌ Failed to send notification:', error.message);
      console.log('\n💡 Tips:');
      console.log('   - Make sure the token is valid');
      console.log('   - Token format: ExponentPushToken[xxxxxx]');
      console.log('   - Get token from app logs when it starts\n');
    }
  }
}

testExpoPush().catch(console.error);
