const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });

const SYSTEM_USER_TOKEN = process.env.FACEBOOK_SYSTEM_USER_TOKEN;
const AD_ACCOUNT_ID = 'act_1055651882781854'; // Your Ad Account RED

async function checkFormFields() {
  console.log('🔍 Checking Facebook Lead Form Fields...\n');

  if (!SYSTEM_USER_TOKEN) {
    console.error('❌ FACEBOOK_SYSTEM_USER_TOKEN not found');
    return;
  }

  try {
    // Get all ad sets with lead forms
    console.log('1️⃣ Fetching ad sets with lead forms...');
    const adSetsResponse = await fetch(
      `https://graph.facebook.com/v23.0/${AD_ACCOUNT_ID}/adsets?fields=id,name,leadgen_form_id&access_token=${SYSTEM_USER_TOKEN}`,
    );

    if (!adSetsResponse.ok) {
      const errorText = await adSetsResponse.text();
      console.error(`❌ Failed to fetch ad sets: ${adSetsResponse.status} - ${errorText}`);
      return;
    }

    const adSetsData = await adSetsResponse.json();
    console.log(`✅ Found ${adSetsData.data?.length || 0} ad sets\n`);

    const processedForms = new Set();

    // Process each ad set that has a lead form
    for (const adSet of adSetsData.data || []) {
      if (adSet.leadgen_form_id && !processedForms.has(adSet.leadgen_form_id)) {
        processedForms.add(adSet.leadgen_form_id);
        
        console.log(`2️⃣ Analyzing form: ${adSet.leadgen_form_id} (${adSet.name})`);
        
        try {
          // Get form details
          const formResponse = await fetch(
            `https://graph.facebook.com/v23.0/${adSet.leadgen_form_id}?fields=id,name,questions&access_token=${SYSTEM_USER_TOKEN}`,
          );

          if (formResponse.ok) {
            const formData = await formResponse.json();
            console.log(`✅ Form Name: ${formData.name}`);
            
            if (formData.questions && formData.questions.length > 0) {
              console.log('\n📋 Form Fields:');
              formData.questions.forEach((question, index) => {
                console.log(`   ${index + 1}. "${question.label}" (Type: ${question.type})`);
              });
            }

            // Get a sample lead to see actual field data
            console.log('\n3️⃣ Fetching sample lead data...');
            const leadsResponse = await fetch(
              `https://graph.facebook.com/v23.0/${adSet.leadgen_form_id}/leads?fields=id,created_time,field_data&limit=1&access_token=${SYSTEM_USER_TOKEN}`,
            );

            if (leadsResponse.ok) {
              const leadsData = await leadsResponse.json();
              
              if (leadsData.data && leadsData.data.length > 0) {
                const sampleLead = leadsData.data[0];
                console.log('\n📝 Sample Lead Data:');
                console.log(`   Lead ID: ${sampleLead.id}`);
                console.log(`   Created: ${sampleLead.created_time}`);
                
                if (sampleLead.field_data) {
                  console.log('\n🔍 Actual Field Data:');
                  sampleLead.field_data.forEach((field, index) => {
                    console.log(`   ${index + 1}. "${field.name}" = "${field.values[0]}"`);
                  });
                  
                  // Create a mapping suggestion
                  console.log('\n💡 Suggested Field Mapping:');
                  const fieldData = {};
                  sampleLead.field_data.forEach((field) => {
                    fieldData[field.name.toLowerCase()] = field.values[0];
                  });
                  
                  // Try to identify name fields
                  const nameFields = Object.keys(fieldData).filter(key => 
                    key.includes('name') || key.includes('first') || key.includes('last')
                  );
                  
                  if (nameFields.length > 0) {
                    console.log('   Name fields found:');
                    nameFields.forEach(field => {
                      console.log(`     - "${field}": "${fieldData[field]}"`);
                    });
                  } else {
                    console.log('   No obvious name fields found');
                  }
                  
                  // Try to identify email fields
                  const emailFields = Object.keys(fieldData).filter(key => 
                    key.includes('email')
                  );
                  
                  if (emailFields.length > 0) {
                    console.log('   Email fields found:');
                    emailFields.forEach(field => {
                      console.log(`     - "${field}": "${fieldData[field]}"`);
                    });
                  }
                  
                  // Try to identify phone fields
                  const phoneFields = Object.keys(fieldData).filter(key => 
                    key.includes('phone') || key.includes('mobile') || key.includes('contact')
                  );
                  
                  if (phoneFields.length > 0) {
                    console.log('   Phone fields found:');
                    phoneFields.forEach(field => {
                      console.log(`     - "${field}": "${fieldData[field]}"`);
                    });
                  }
                }
              } else {
                console.log('   No leads found in this form yet');
              }
            } else {
              const errorText = await leadsResponse.text();
              console.error(`   ❌ Failed to fetch leads: ${errorText}`);
            }
          } else {
            const errorText = await formResponse.text();
            console.error(`   ❌ Failed to fetch form details: ${errorText}`);
          }
        } catch (error) {
          console.error(`   ❌ Error processing form: ${error.message}`);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkFormFields().catch(console.error); 