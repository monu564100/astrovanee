import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';

async function testEndpoints() {
  console.log('Testing backend endpoints...\n');

  try {
    // Test server health
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is running:', healthData);
    } else {
      console.log('❌ Server health check failed');
      return;
    }

    // Test consultation creation
    console.log('\n2. Testing consultation creation...');
    const createResponse = await fetch(`${BASE_URL}/consultations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId: 1, userId: 1 })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Consultation created:', createData);
      
      const consultationId = createData.consultationId;

      // Test start call
      console.log('\n3. Testing start call...');
      const startResponse = await fetch(`${BASE_URL}/consultations/start-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId, vendorId: 1 })
      });

      if (startResponse.ok) {
        const startData = await startResponse.json();
        console.log('✅ Call started:', startData);

        // Test token generation
        console.log('\n4. Testing token generation...');
        const tokenResponse = await fetch(`${BASE_URL}/tokens/rtc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consultationId,
            channelName: `consultation_${consultationId}`,
            uid: 100001,
            vendorId: 1
          })
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          console.log('✅ Token generated successfully');
          console.log('   - Token length:', tokenData.token.length);
          console.log('   - UID:', tokenData.uid);
          console.log('   - Channel:', tokenData.channelName);

          // Test user token (should work after call started)
          console.log('\n5. Testing user token generation...');
          const userTokenResponse = await fetch(`${BASE_URL}/tokens/rtc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              consultationId,
              channelName: `consultation_${consultationId}`,
              uid: 200001
              // No vendorId - this is a user request
            })
          });

          if (userTokenResponse.ok) {
            const userTokenData = await userTokenResponse.json();
            console.log('✅ User token generated successfully');
            console.log('   - Token length:', userTokenData.token.length);
            console.log('   - UID:', userTokenData.uid);
          } else {
            const errorData = await userTokenResponse.json();
            console.log('❌ User token generation failed:', errorData.error);
          }

        } else {
          const errorData = await tokenResponse.json();
          console.log('❌ Token generation failed:', errorData.error);
        }

      } else {
        const errorData = await startResponse.json();
        console.log('❌ Start call failed:', errorData.error);
      }

    } else {
      const errorData = await createResponse.json();
      console.log('❌ Consultation creation failed:', errorData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the backend server is running:');
    console.log('cd Backend && npm start');
  }
}

testEndpoints();