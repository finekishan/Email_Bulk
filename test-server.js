// Simple server test
import { config } from 'dotenv';
config();

console.log('Testing server startup...');

try {
  // Import the app
  const { mongoDatabase } = await import('./src/services/mongoDatabase.js');
  
  console.log('✅ MongoDB service imported');
  
  // Test connection
  await mongoDatabase.connect();
  console.log('✅ MongoDB connected');
  
  // Import app
  const app = await import('./src/app.js');
  console.log('✅ App imported successfully');
  
  console.log('🎉 Server can start without errors');
  
} catch (error) {
  console.error('❌ Server startup error:', error.message);
  console.error('Stack:', error.stack);
}