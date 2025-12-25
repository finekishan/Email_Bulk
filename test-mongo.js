import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'bulk_email_sender';

async function testMongoDB() {
  console.log('🔗 Testing MongoDB connection and data insertion...');
  console.log('URI:', MONGODB_URI ? 'Connected' : 'Not found');
  console.log('DB Name:', DB_NAME);

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    
    // Test data insertion
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'test123',
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(testUser);
    console.log('✅ Test user inserted with ID:', result.insertedId);

    // Check if data exists
    const users = await db.collection('users').find({}).toArray();
    console.log('📊 Total users in database:', users.length);
    
    users.forEach(user => {
      console.log('👤 User:', user.email, '- Created:', user.createdAt);
    });

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));

    await client.close();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMongoDB();