const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Load environment variables
dotenv.config({ path: '.env' });

const SYSTEM_USER_TOKEN = process.env.FACEBOOK_SYSTEM_USER_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;
const FORM_ID = '1748282759149458'; // Your specific form ID

async function syncLeadsToDatabase() {
  console.log('🔄 Syncing Facebook Leads to MongoDB Atlas...\n');
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
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db();
    console.log(`📁 Using database: ${db.databaseName}`);
    const leadsCollection = db.collection('leads');
    console.log(`📄 Using collection: leads`);

    // Get form details
    console.log('1️⃣ Fetching form details...');
    const formResponse = await fetch(
      `https://graph.facebook.com/v23.0/${FORM_ID}?fields=id,name&access_token=${SYSTEM_USER_TOKEN}`,
    );

    if (!formResponse.ok) {
      const errorText = await formResponse.text();
      console.error(`❌ Failed to fetch form: ${formResponse.status} - ${errorText}`);
      return;
    }

    const formData = await formResponse.json();
    console.log(`✅ Form Name: ${formData.name}`);

    // Get all leads from this form
    console.log('\n2️⃣ Fetching all leads...');
    const leadsResponse = await fetch(
      `https://graph.facebook.com/v23.0/${FORM_ID}/leads?fields=id,created_time,field_data&limit=100&access_token=${SYSTEM_USER_TOKEN}`,
    );

    if (!leadsResponse.ok) {
      const errorText = await leadsResponse.text();
      console.error(`❌ Failed to fetch leads: ${errorText}`);
      return;
    }

    const leadsData = await leadsResponse.json();
    console.log(`✅ Found ${leadsData.data?.length || 0} leads in this form`);
    
    if (leadsData.data && leadsData.data.length > 0) {
      console.log('\n3️⃣ Processing and saving leads to database...');
      
      let savedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const lead of leadsData.data) {
        try {
          console.log(`\n🔍 Processing lead: ${lead.id}`);
          
          // Check if lead already exists in database
          const existingLead = await leadsCollection.findOne({ leadgenId: lead.id });
          
          if (existingLead) {
            console.log(`   ⏭️  Lead already exists, skipping...`);
            skippedCount++;
            continue;
          }

          // Extract field data
          const fieldData = {};
          if (lead.field_data) {
            lead.field_data.forEach((field) => {
              if (field.values && field.values.length > 0) {
                fieldData[field.name] = field.values[0];
              }
            });
          }

          // Create lead document
          const leadDocument = {
            leadgenId: lead.id,
            formId: FORM_ID,
            formName: formData.name,
            name: fieldData['full name'] || "Unknown",
            email: fieldData.email || "",
            phone: fieldData.phone_number || null,
            budget: fieldData['what_is_your_budget?'] || null,
            plotSize: fieldData['what_plot_size_are_you_looking_for?'] || null,
            city: fieldData.city || null,
            status: "New",
            createdAt: new Date(lead.created_time),
            updatedAt: new Date(),
            source: "facebook_form_sync"
          };

          // Save to database
          const result = await leadsCollection.insertOne(leadDocument);
          console.log(`   ✅ Saved: "${leadDocument.name}" (${leadDocument.email}) - DB ID: ${result.insertedId}`);
          savedCount++;

          // Add a small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`   ❌ Error processing lead ${lead.id}:`, error.message);
          errorCount++;
        }
      }

      console.log(`\n📊 Sync Summary:`);
      console.log(`   ✅ Saved: ${savedCount} new leads`);
      console.log(`   ⏭️  Skipped: ${skippedCount} existing leads`);
      console.log(`   ❌ Errors: ${errorCount} leads`);

    } else {
      console.log('   No leads found in this form');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

// Run the sync
syncLeadsToDatabase().catch(console.error); 