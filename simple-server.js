import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';

config();

const app = new Hono();
const client = new MongoClient(process.env.MONGODB_URI);
let db;

// Connect to MongoDB
async function connectDB() {
  await client.connect();
  db = client.db(process.env.MONGODB_DB_NAME || 'bulk_email_sender');
  console.log('✅ Connected to MongoDB');
}

// CORS
app.use('*', cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database status
app.get('/db-status', async (c) => {
  try {
    const users = await db.collection('users').countDocuments();
    const sessions = await db.collection('sessions').countDocuments();
    const collections = await db.listCollections().toArray();
    
    return c.json({
      success: true,
      database: process.env.MONGODB_DB_NAME || 'bulk_email_sender',
      collections: collections.map(c => c.name),
      counts: { users, sessions }
    });
  } catch (error) {
    return c.json({ success: false, error: error.message });
  }
});

// Register
app.post('/auth/register', async (c) => {
  try {
    const { email, name, password } = await c.req.json();
    
    if (!email || !name || !password) {
      return c.json({ success: false, message: 'All fields required' }, 400);
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return c.json({ success: false, message: 'User already exists' }, 400);
    }

    const passwordHash = await hash(password);
    const result = await db.collection('users').insertOne({
      email, 
      name, 
      passwordHash, 
      createdAt: new Date(),
      isActive: true
    });

    console.log('✅ User registered:', email, 'ID:', result.insertedId);
    
    // Verify insertion
    const insertedUser = await db.collection('users').findOne({ _id: result.insertedId });
    console.log('✅ Verified user in DB:', insertedUser ? 'Found' : 'Not found');
    
    return c.json({ 
      success: true, 
      message: 'User registered successfully', 
      user: { id: result.insertedId, email, name } 
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return c.json({ success: false, message: 'Registration failed: ' + error.message }, 500);
  }
});

// Auth middleware
async function requireAuth(c) {
  try {
    const token = c.req.header('cookie')?.split('session_token=')[1]?.split(';')[0];
    if (!token) {
      return c.json({ success: false, message: 'Authentication required' }, 401);
    }
    
    const session = await db.collection('sessions').findOne({
      token,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return c.json({ success: false, message: 'Invalid session' }, 401);
    }
    
    const user = await db.collection('users').findOne({ _id: session.userId });
    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 401);
    }
    
    c.user = { id: user._id, email: user.email, name: user.name };
    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ success: false, message: 'Authentication failed' }, 401);
  }
}

// Login
app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 401);
    }
    
    const isValidPassword = await verify(user.passwordHash, password);
    if (!isValidPassword) {
      return c.json({ success: false, message: 'Invalid password' }, 401);
    }

    const token = randomBytes(32).toString('hex');
    const sessionResult = await db.collection('sessions').insertOne({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date()
    });

    c.header('Set-Cookie', `session_token=${token}; HttpOnly; Path=/; Max-Age=86400`);
    
    console.log('✅ User logged in:', email, 'Session ID:', sessionResult.insertedId);
    return c.json({ 
      success: true, 
      message: 'Login successful',
      user: { id: user._id, email: user.email, name: user.name } 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return c.json({ success: false, message: 'Login failed: ' + error.message }, 500);
  }
});

// Dashboard
app.get('/dashboard/stats', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  try {
    const userId = c.user.id;
    const emailLogs = await db.collection('emailLogs').find({ userId }).toArray();
    const smtpConfigs = await db.collection('smtpConfigs').countDocuments({ userId });
    
    const total = emailLogs.length;
    const sent = emailLogs.filter(log => log.status === 'sent').length;
    const failed = emailLogs.filter(log => log.status === 'failed').length;
    
    return c.json({
      success: true,
      stats: {
        total,
        sent,
        failed,
        successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
        smtpConfigs
      }
    });
  } catch (error) {
    return c.json({ success: false, message: 'Failed to get stats' }, 500);
  }
});

// SMTP Config
app.get('/config/smtp', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  try {
    const configs = await db.collection('smtpConfigs').find({ userId: c.user.id }).toArray();
    return c.json({ success: true, configs });
  } catch (error) {
    return c.json({ success: false, message: 'Failed to get configs' }, 500);
  }
});

app.post('/config/smtp', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  try {
    const { name, host, port, user, pass, fromEmail, fromName } = await c.req.json();
    
    const result = await db.collection('smtpConfigs').insertOne({
      userId: c.user.id,
      name,
      host,
      port: parseInt(port) || 587,
      user,
      pass,
      fromEmail,
      fromName,
      createdAt: new Date()
    });
    
    return c.json({ success: true, message: 'SMTP config saved', id: result.insertedId });
  } catch (error) {
    return c.json({ success: false, message: 'Failed to save config' }, 500);
  }
});

// Send Emails (GET for form display)
app.get('/send', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  return c.json({ 
    success: true, 
    message: 'Send email endpoint ready',
    user: c.user
  });
});

app.post('/send', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  try {
    const { subject, message, recipients } = await c.req.json();
    
    // Log email attempt
    const logPromises = recipients.map(email => 
      db.collection('emailLogs').insertOne({
        userId: c.user.id,
        email,
        subject,
        status: 'sent',
        timestamp: new Date()
      })
    );
    
    await Promise.all(logPromises);
    
    return c.json({ 
      success: true, 
      message: `${recipients.length} emails queued for sending`,
      sent: recipients.length
    });
  } catch (error) {
    return c.json({ success: false, message: 'Failed to send emails' }, 500);
  }
});

// Reports
app.get('/report', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  try {
    const logs = await db.collection('emailLogs')
      .find({ userId: c.user.id })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    return c.json({ success: true, logs });
  } catch (error) {
    return c.json({ success: false, message: 'Failed to get reports' }, 500);
  }
});

app.delete('/report/clear', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  try {
    await db.collection('emailLogs').deleteMany({ userId: c.user.id });
    return c.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    return c.json({ success: false, message: 'Failed to clear logs' }, 500);
  }
});

// Start server
async function start() {
  await connectDB();
  const port = process.env.PORT || 3000;
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`🚀 Server running on http://localhost:${info.port}`);
  });
}

start().catch(err => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});