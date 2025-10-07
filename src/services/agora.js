import pkg from 'agora-access-token';
// Some versions of agora-access-token expose CommonJS default export
const { RtcRole, RtcTokenBuilder, RtmRole, RtmTokenBuilder } = pkg;

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERT = process.env.AGORA_APP_CERTIFICATE;

if (!APP_ID || !APP_CERT) {
  console.warn('AGORA credentials missing in env');
}

export function buildRtcToken(channelName, uid, role = RtcRole.PUBLISHER, expireSeconds = 3600) {
  console.log('Building RTC token:', { channelName, uid: Number(uid), role, expireSeconds });
  
  if (!APP_ID || !APP_CERT) {
    throw new Error('Agora credentials not configured');
  }
  
  const now = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = now + expireSeconds;
  
  try {
    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERT, channelName, Number(uid), role, privilegeExpireTime);
    console.log('Token generated successfully, length:', token.length);
    return token;
  } catch (error) {
    console.error('Token generation failed:', error);
    throw error;
  }
}

export function buildRtmToken(account, expireSeconds = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = now + expireSeconds;
  return RtmTokenBuilder.buildToken(APP_ID, APP_CERT, account, RtmRole.Rtm_User, privilegeExpireTime);
}
