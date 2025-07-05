const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });

const SYSTEM_USER_TOKEN = process.env.FACEBOOK_SYSTEM_USER_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/facebook';

async function testWebhook() {
  console.log('🧪 Testing webhook with new lead...\n');

  if (!SYSTEM_USER_TOKEN) {
    console.error('❌ FACEBOOK_SYSTEM_USER_TOKEN not found');
    return;
  }

  // Simulate a webhook payload for a new lead
  const webhookPayload = {
    "entry": [{
      "id": "739575385894896",
      "time": 1751718938,
      "changes": [{
        "value": {
          "created_time": 1751718935,
          "leadgen_id": "1808370349873146",
          "page_id": "739575385894896",
          "form_id": "2547295018953105"
        },
        "field": "leadgen"
      }]
    }],
    "object": "page"
  };

  try {
    console.log('📤 Sending webhook payload...');
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=test-signature' // This will be ignored in test mode
      },
      body: JSON.stringify(webhookPayload)
    });

    console.log(`\n📥 Response Status: ${response.status}`);
    const responseText = await response.text();
    console.log(`📥 Response Body: ${responseText}`);

    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }

  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
}

// Run the test
testWebhook().catch(console.error); 