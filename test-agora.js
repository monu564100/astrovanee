import pkg from 'agora-access-token';
import dotenv from 'dotenv';

const { RtcTokenBuilder, RtcRole } = pkg;
dotenv.config();

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERT = process.env.AGORA_APP_CERTIFICATE;

console.log('Testing Agora credentials...');
console.log('APP_ID:', APP_ID ? APP_ID.substring(0, 8) + '...' : 'MISSING');
console.log('APP_CERT:', APP_CERT ? APP_CERT.substring(0, 8) + '...' : 'MISSING');

if (!APP_ID || !APP_CERT) {
  console.error('❌ Missing Agora credentials in .env file');
  process.exit(1);
}

try {
  const channelName = 'test_channel';
  const uid = 12345;
  const role = RtcRole.PUBLISHER;
  const expireSeconds = 3600;
  
  console.log('\nGenerating test token...');
  console.log('Channel:', channelName);
  console.log('UID:', uid);
  console.log('Role:', role);
  
  const now = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = now + expireSeconds;
  
  const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERT, channelName, uid, role, privilegeExpireTime);
  
  console.log('✅ Token generated successfully!');
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Verify token format
  if (token.length > 100 && token.startsWith('007')) {
    console.log('✅ Token format looks correct');
  } else {
    console.log('⚠️ Token format might be incorrect');
  }
  
} catch (error) {
  console.error('❌ Token generation failed:', error.message);
  process.exit(1);
}