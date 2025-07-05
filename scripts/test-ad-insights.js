const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });

const SYSTEM_USER_TOKEN = process.env.FACEBOOK_SYSTEM_USER_TOKEN;
const AD_ACCOUNT_ID = 'act_1055651882781854'; // Your Ad Account RED

async function testAdInsights() {
  console.log('🔍 Testing Facebook Ad Insights...\n');

  if (!SYSTEM_USER_TOKEN) {
    console.error('❌ FACEBOOK_SYSTEM_USER_TOKEN not found');
    return;
  }

  // Calculate date range (last 30 days)
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - 30);
  
  const untilDate = new Date();
  untilDate.setDate(untilDate.getDate() - 1);
  
  const sinceStr = sinceDate.toISOString().split('T')[0];
  const untilStr = untilDate.toISOString().split('T')[0];

  console.log(`📅 Date Range: ${sinceStr} to ${untilStr}\n`);

  try {
    // Enhanced fields to get more detailed information
    const fields = [
      'impressions',
      'clicks', 
      'spend',
      'cpc',
      'cost_per_lead',
      'date_start',
      'date_stop',
      'account_name',
      'account_id'
    ].join(',');

    const url = `https://graph.facebook.com/v23.0/${AD_ACCOUNT_ID}/insights?fields=${fields}&time_range={'since':'${sinceStr}','until':'${untilStr}'}&access_token=${SYSTEM_USER_TOKEN}`;
    
    console.log('🌐 Making API request...');
    console.log(`URL: ${url.replace(SYSTEM_USER_TOKEN, '[TOKEN_HIDDEN]')}\n`);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    
    console.log('✅ Raw API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      const insight = data.data[0];
      console.log('\n📊 Processed Data:');
      console.log(`   Account: ${insight.account_name || 'Unknown'} (${insight.account_id || AD_ACCOUNT_ID})`);
      console.log(`   Currency: ${insight.currency || insight.account_currency || 'USD'}`);
      console.log(`   Date Range: ${insight.date_start} to ${insight.date_stop}`);
      console.log(`   Impressions: ${Number(insight.impressions || 0).toLocaleString()}`);
      console.log(`   Clicks: ${Number(insight.clicks || 0).toLocaleString()}`);
      console.log(`   Spend: ${insight.currency || insight.account_currency || 'USD'} ${Number(insight.spend || 0).toFixed(2)}`);
      console.log(`   CPC: ${insight.currency || insight.account_currency || 'USD'} ${Number(insight.cpc || 0).toFixed(2)}`);
      console.log(`   Cost per Lead: ${insight.currency || insight.account_currency || 'USD'} ${Number(insight.cost_per_lead || 0).toFixed(2)}`);
    } else {
      console.log('⚠️  No data returned for the specified date range');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testAdInsights().catch(console.error); 