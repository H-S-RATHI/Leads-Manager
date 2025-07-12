const { MongoClient } = require('mongodb');

async function updateLeadsCategory() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const leadsCollection = db.collection('leads');

    // Find leads that don't have a category field
    const leadsWithoutCategory = await leadsCollection.find({
      category: { $exists: false }
    }).toArray();

    console.log(`Found ${leadsWithoutCategory.length} leads without category field`);

    if (leadsWithoutCategory.length > 0) {
      // Update all leads without category to have "none" as default
      const result = await leadsCollection.updateMany(
        { category: { $exists: false } },
        { $set: { category: "none" } }
      );

      console.log(`Updated ${result.modifiedCount} leads with default category "none"`);
    } else {
      console.log('All leads already have category field');
    }

    // Verify the update
    const totalLeads = await leadsCollection.countDocuments();
    const leadsWithCategory = await leadsCollection.countDocuments({ category: { $exists: true } });
    
    console.log(`Total leads: ${totalLeads}`);
    console.log(`Leads with category field: ${leadsWithCategory}`);

  } catch (error) {
    console.error('Error updating leads:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateLeadsCategory(); 