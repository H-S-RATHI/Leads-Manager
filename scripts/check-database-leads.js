const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Load environment variables
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDatabaseLeads() {
  console.log('🔍 Checking leads in MongoDB Atlas database...\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    return;
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db();
    const leadsCollection = db.collection('leads');

    // Get total count
    const totalCount = await leadsCollection.countDocuments();
    console.log(`📊 Total leads in database: ${totalCount}`);

    // Get all leads with details
    const leads = await leadsCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    console.log('\n📋 All leads in database:');
    leads.forEach((lead, index) => {
      console.log(`\n--- Lead ${index + 1} ---`);
      console.log(`   Lead ID: ${lead.leadgenId || lead._id}`);
      console.log(`   Name: ${lead.name}`);
      console.log(`   Email: ${lead.email}`);
      console.log(`   Phone: ${lead.phone}`);
      console.log(`   Budget: ${lead.budget}`);
      console.log(`   Plot Size: ${lead.plotSize}`);
      console.log(`   City: ${lead.city}`);
      console.log(`   Status: ${lead.status}`);
      console.log(`   Form ID: ${lead.formId}`);
      console.log(`   Form Name: ${lead.formName || 'Not set'}`);
      console.log(`   Created: ${lead.createdAt}`);
      console.log(`   Updated: ${lead.updatedAt}`);
      console.log(`   Source: ${lead.source}`);
    });

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

// Run the check
checkDatabaseLeads().catch(console.error); 