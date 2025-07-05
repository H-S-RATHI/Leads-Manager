const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });

const SYSTEM_USER_TOKEN = process.env.FACEBOOK_SYSTEM_USER_TOKEN;

async function testFacebookToken() {
  console.log('🔍 Testing Facebook System User Token...\n');

  if (!SYSTEM_USER_TOKEN) {
    console.error('❌ FACEBOOK_SYSTEM_USER_TOKEN not found in environment variables');
    return;
  }

  console.log('✅ Token found in environment variables\n');

  // Test 1: Check token validity
  console.log('1️⃣ Testing token validity...');
  try {
    const response = await fetch(`https://graph.facebook.com/debug_token?input_token=${SYSTEM_USER_TOKEN}&access_token=${SYSTEM_USER_TOKEN}`);
    const data = await response.json();
    
    if (data.data && data.data.is_valid) {
      console.log('✅ Token is valid');
      console.log(`   - App ID: ${data.data.app_id}`);
      console.log(`   - User ID: ${data.data.user_id}`);
      console.log(`   - Expires: ${data.data.expires_at ? new Date(data.data.expires_at * 1000).toISOString() : 'Never'}`);
    } else {
      console.log('❌ Token is invalid');
      console.log('   Error:', data.error || 'Unknown error');
      return;
    }
  } catch (error) {
    console.log('❌ Failed to validate token:', error.message);
    return;
  }

  // Test 2: Check permissions
  console.log('\n2️⃣ Testing permissions...');
  try {
    const response = await fetch(`https://graph.facebook.com/me/permissions?access_token=${SYSTEM_USER_TOKEN}`);
    const data = await response.json();
    
    if (data.data) {
      console.log('✅ Permissions retrieved:');
      data.data.forEach(permission => {
        console.log(`   - ${permission.permission}: ${permission.status}`);
      });
    } else {
      console.log('❌ Failed to get permissions');
    }
  } catch (error) {
    console.log('❌ Failed to check permissions:', error.message);
  }

  // Test 3: Check accessible ad accounts
  console.log('\n3️⃣ Testing ad account access...');
  try {
    // Try the business manager endpoint first
    const response = await fetch(`https://graph.facebook.com/me/adaccounts?fields=id,name,account_status&access_token=${SYSTEM_USER_TOKEN}`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      console.log('✅ Accessible ad accounts:');
      data.data.forEach(account => {
        console.log(`   - ${account.name} (${account.id}) - Status: ${account.account_status}`);
      });
    } else {
      // Try direct access to the specific ad account
      console.log('⚠️  No ad accounts via /me/adaccounts, trying direct access...');
      const adAccountId = 'act_1055651882781854'; // Your Ad Account RED
      const directResponse = await fetch(`https://graph.facebook.com/v23.0/${adAccountId}?fields=id,name,account_status&access_token=${SYSTEM_USER_TOKEN}`);
      const directData = await directResponse.json();
      
      if (directData.id) {
        console.log('✅ Direct ad account access successful:');
        console.log(`   - ${directData.name} (${directData.id}) - Status: ${directData.account_status}`);
      } else {
        console.log('❌ No ad accounts accessible');
        console.log('   Error:', directData.error || 'Unknown error');
      }
    }
  } catch (error) {
    console.log('❌ Failed to get ad accounts:', error.message);
  }

  // Test 4: Check accessible pages
  console.log('\n4️⃣ Testing page access...');
  try {
    const response = await fetch(`https://graph.facebook.com/me/accounts?fields=id,name,category&access_token=${SYSTEM_USER_TOKEN}`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      console.log('✅ Accessible pages:');
      data.data.forEach(page => {
        console.log(`   - ${page.name} (${page.id}) - Category: ${page.category}`);
      });
    } else {
      console.log('❌ No pages accessible');
    }
  } catch (error) {
    console.log('❌ Failed to get pages:', error.message);
  }

  // Test 5: Check pixel access
  console.log('\n5️⃣ Testing pixel access...');
  try {
    const pixelId = process.env.FACEBOOK_PIXEL_ID || '744231038161969'; // Your RED pixel
    const response = await fetch(`https://graph.facebook.com/v23.0/${pixelId}?fields=id,name&access_token=${SYSTEM_USER_TOKEN}`);
    const data = await response.json();
    
    if (data.id) {
      console.log('✅ Pixel accessible:');
      console.log(`   - ${data.name || 'RED pixel Account'} (${data.id})`);
    } else {
      console.log('❌ Pixel not accessible');
      console.log('   Error:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Failed to access pixel:', error.message);
  }

  console.log('\n🎉 Token testing completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Start your development server: npm run dev');
  console.log('   2. Go to /dashboard/ads to test ad insights');
  console.log('   3. Check console logs for "[Facebook] Using System User token"');
}

// Run the test
testFacebookToken().catch(console.error); 