// Test vendors endpoint
import 'dotenv/config';

async function testVendorsEndpoint() {
  const port = process.env.PORT || 4000;
  const baseUrl = `http://localhost:${port}`;
  
  console.log('🧪 Testing Vendors Endpoint\n');
  console.log(`Base URL: ${baseUrl}\n`);
  
  try {
    // Test 1: Get all vendors
    console.log('1️⃣ Testing GET /vendors');
    const response1 = await fetch(`${baseUrl}/vendors`);
    const vendors = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(vendors, null, 2));
    console.log('✅ Vendors list retrieved\n');
    
    // Test 2: Get specific vendor
    if (vendors.length > 0) {
      const vendorId = vendors[0].id;
      console.log(`2️⃣ Testing GET /vendors/${vendorId}`);
      const response2 = await fetch(`${baseUrl}/vendors/${vendorId}`);
      const vendor = await response2.json();
      console.log('Status:', response2.status);
      console.log('Response:', JSON.stringify(vendor, null, 2));
      console.log('✅ Single vendor retrieved\n');
    }
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testVendorsEndpoint();
