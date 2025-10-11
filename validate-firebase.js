import { config } from 'dotenv';

config();

console.log('\n🔍 Firebase Configuration Validator\n');
console.log('=' .repeat(50));

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountEnv) {
  console.log('\n❌ FIREBASE_SERVICE_ACCOUNT not found in .env file\n');
  console.log('📝 To fix this:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Go to Project Settings → Service Accounts');
  console.log('4. Click "Generate New Private Key"');
  console.log('5. Copy the entire JSON content');
  console.log('6. Remove all line breaks (make it one line)');
  console.log('7. Add to .env file:');
  console.log('   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}\n');
  process.exit(1);
}

console.log('\n✅ FIREBASE_SERVICE_ACCOUNT found in .env\n');
console.log('📏 Length:', serviceAccountEnv.length, 'characters');

// Try to parse
let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountEnv);
  console.log('✅ JSON is valid and can be parsed\n');
} catch (error) {
  console.log('❌ JSON parsing failed:', error.message, '\n');
  console.log('🔍 First 100 characters of your JSON:');
  console.log(serviceAccountEnv.substring(0, 100), '...\n');
  console.log('💡 Common issues:');
  console.log('   - Extra quotes around the JSON');
  console.log('   - Line breaks in the JSON (must be one line)');
  console.log('   - Missing quotes around property names');
  console.log('   - Unescaped backslashes in private_key\n');
  console.log('📝 Correct format:');
  console.log('   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}\n');
  process.exit(1);
}

// Validate required fields
console.log('🔍 Validating required fields:\n');

const requiredFields = [
  'type',
  'project_id',
  'private_key_id',
  'private_key',
  'client_email',
  'client_id',
  'auth_uri',
  'token_uri',
];

let allValid = true;

requiredFields.forEach(field => {
  if (serviceAccount[field]) {
    console.log(`   ✅ ${field}: Present`);
    if (field === 'project_id') {
      console.log(`      → ${serviceAccount[field]}`);
    } else if (field === 'client_email') {
      console.log(`      → ${serviceAccount[field]}`);
    }
  } else {
    console.log(`   ❌ ${field}: Missing`);
    allValid = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('\n✅ Firebase configuration is VALID!');
  console.log('\n📊 Summary:');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  console.log(`   Type: ${serviceAccount.type}`);
  console.log('\n🚀 Your backend should now be able to send push notifications!\n');
} else {
  console.log('\n❌ Firebase configuration is INVALID');
  console.log('\n📝 Please download a fresh service account JSON from Firebase Console\n');
  process.exit(1);
}
