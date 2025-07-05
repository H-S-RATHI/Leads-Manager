const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Load environment variables
dotenv.config({ path: '.env' });

const SYSTEM_USER_TOKEN = process.env.FACEBOOK_SYSTEM_USER_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;
const FORM_ID = '2547295018953105'; // Your specific form ID

async function checkSpecificForm() {
  console.log('🔍 Checking Specific Form Fields...\n');
  console.log(`Form ID: ${FORM_ID}\n`);

  if (!SYSTEM_USER_TOKEN) {
    console.error('❌ FACEBOOK_SYSTEM_USER_TOKEN not found');
    return;
  }

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    return;
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    // Get form details
    console.log('1️⃣ Fetching form details...');
    const formResponse = await fetch(
      `https://graph.facebook.com/v23.0/${FORM_ID}?fields=id,name,questions&access_token=${SYSTEM_USER_TOKEN}`,
    );

    if (!formResponse.ok) {
      const errorText = await formResponse.text();
      console.error(`❌ Failed to fetch form: ${formResponse.status} - ${errorText}`);
      return;
    }

    const formData = await formResponse.json();
    console.log(`✅ Form Name: ${formData.name}`);
    
    if (formData.questions && formData.questions.length > 0) {
      console.log('\n📋 Form Fields:');
      formData.questions.forEach((question, index) => {
        console.log(`   ${index + 1}. "${question.label}" (Type: ${question.type})`);
      });
    }

        // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db();
    const leadsCollection = db.collection('leads');

    // Get all leads from this form
    console.log('\n2️⃣ Fetching all leads...');
    const leadsResponse = await fetch(
      `https://graph.facebook.com/v23.0/${FORM_ID}/leads?fields=id,created_time,field_data&limit=100&access_token=${SYSTEM_USER_TOKEN}`,
    );

    if (leadsResponse.ok) {
      const leadsData = await leadsResponse.json();
      console.log(`✅ Found ${leadsData.data?.length || 0} leads in this form`);
      
      if (leadsData.data && leadsData.data.length > 0) {
        console.log('\n📝 Processing and saving leads to database...');
        
        let savedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        leadsData.data.forEach((lead, index) => {
           console.log(`\n--- Lead ${index + 1} ---`);
           console.log(`   Lead ID: ${lead.id}`);
           console.log(`   Created: ${lead.created_time}`);
           
           try {
             if (lead.field_data) {
             console.log('   Field Data:');
             lead.field_data.forEach((field, fieldIndex) => {
               const value = field.values && field.values.length > 0 ? field.values[0] : '(no data)';
               console.log(`     ${fieldIndex + 1}. "${field.name}" = "${value}"`);
             });
             
             // Create a mapping suggestion
             console.log('\n   💡 Field Mapping:');
             const fieldData = {};
             lead.field_data.forEach((field) => {
               if (field.values && field.values.length > 0) {
                 fieldData[field.name.toLowerCase()] = field.values[0];
               }
             });
            
            // Try to identify name fields
            const nameFields = Object.keys(fieldData).filter(key => 
              key.includes('name') || key.includes('first') || key.includes('last') || key.includes('full')
            );
            
            if (nameFields.length > 0) {
              console.log('     Name fields found:');
              nameFields.forEach(field => {
                console.log(`       - "${field}": "${fieldData[field]}"`);
              });
            } else {
              console.log('     No obvious name fields found');
            }
            
            // Try to identify email fields
            const emailFields = Object.keys(fieldData).filter(key => 
              key.includes('email')
            );
            
            if (emailFields.length > 0) {
              console.log('     Email fields found:');
              emailFields.forEach(field => {
                console.log(`       - "${field}": "${fieldData[field]}"`);
              });
            }
            
            // Try to identify phone fields
            const phoneFields = Object.keys(fieldData).filter(key => 
              key.includes('phone') || key.includes('mobile') || key.includes('contact')
            );
            
            if (phoneFields.length > 0) {
              console.log('     Phone fields found:');
              phoneFields.forEach(field => {
                console.log(`       - "${field}": "${fieldData[field]}"`);
              });
            }
            
            // Try to identify budget fields
            const budgetFields = Object.keys(fieldData).filter(key => 
              key.includes('budget') || key.includes('price') || key.includes('cost')
            );
            
            if (budgetFields.length > 0) {
              console.log('     Budget fields found:');
              budgetFields.forEach(field => {
                console.log(`       - "${field}": "${fieldData[field]}"`);
              });
            }
            
            // Try to identify plot size fields
            const plotFields = Object.keys(fieldData).filter(key => 
              key.includes('plot') || key.includes('size') || key.includes('area')
            );
            
            if (plotFields.length > 0) {
              console.log('     Plot size fields found:');
              plotFields.forEach(field => {
                console.log(`       - "${field}": "${fieldData[field]}"`);
              });
            }
            
                         // Show all fields for debugging
             console.log('\n     🔍 All Fields:');
             Object.keys(fieldData).forEach(field => {
               console.log(`       - "${field}": "${fieldData[field]}"`);
             });
           }
           } catch (error) {
             console.log(`   ❌ Error processing lead data: ${error.message}`);
           }
         });
      } else {
        console.log('   No leads found in this form yet');
      }
    } else {
      const errorText = await leadsResponse.text();
      console.error(`❌ Failed to fetch leads: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkSpecificForm().catch(console.error);