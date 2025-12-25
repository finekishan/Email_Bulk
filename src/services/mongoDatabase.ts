// src/services/mongoDatabase.ts - MongoDB Database Service
import { MongoClient, Db, ObjectId } from 'mongodb';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'bulk_email_sender';

class MongoDatabase {
  private client: MongoClient;
  private db: Db | null = null;

  constructor() {
    this.client = new MongoClient(MONGODB_URI);
  }

  async connect() {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      console.log('✅ Connected to MongoDB');
      await this.initializeCollections();
    }
    return this.db;
  }

  private async initializeCollections() {
    const db = await this.connect();
    
    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('smtpConfigs').createIndex({ userId: 1 });
    await db.collection('scheduledJobs').createIndex({ userId: 1 });
    await db.collection('emailLogs').createIndex({ userId: 1, timestamp: -1 });
  }

  // User Management
  async createUser(email: string, name: string, password: string): Promise<string> {
    const db = await this.connect();
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const passwordHash = await hash(password);
    const result = await db.collection('users').insertOne({
      email,
      name,
      passwordHash,
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    });

    return result.insertedId.toString();
  }

  async authenticateUser(email: string, password: string) {
    const db = await this.connect();
    const user = await db.collection('users').findOne({ email });

    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await verify(user.passwordHash, password);
    if (!isValid) {
      return null;
    }

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };
  }

  // Session Management
  async createSession(userId: string): Promise<string> {
    const db = await this.connect();
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.collection('sessions').insertOne({
      userId: new ObjectId(userId),
      token,
      expiresAt,
      createdAt: new Date()
    });

    return token;
  }

  validateSession(token: string) {
    const db = this.db;
    if (!db) return null;

    const session = db.collection('sessions').findOne({
      token,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return null;
    }

    return session;
  }

  async getUserBySession(token: string) {
    const db = await this.connect();
    const session = await db.collection('sessions').findOne({
      token,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return null;
    }

    const user = await db.collection('users').findOne({ _id: session.userId });
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };
  }

  async deleteSession(token: string) {
    const db = await this.connect();
    await db.collection('sessions').deleteOne({ token });
  }

  async cleanExpiredSessions() {
    const db = await this.connect();
    const result = await db.collection('sessions').deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount;
  }

  // SMTP Configuration Management
  async createSMTPConfig(userId: string, config: any) {
    const db = await this.connect();
    
    // If this is set as default, unset other defaults
    if (config.isDefault) {
      await db.collection('smtpConfigs').updateMany(
        { userId: new ObjectId(userId) },
        { $set: { isDefault: false } }
      );
    }

    const result = await db.collection('smtpConfigs').insertOne({
      userId: new ObjectId(userId),
      ...config,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return result.insertedId.toString();
  }

  async getSMTPConfigs(userId: string) {
    const db = await this.connect();
    const configs = await db.collection('smtpConfigs')
      .find({ userId: new ObjectId(userId) })
      .toArray();

    return configs.map(config => ({
      id: config._id.toString(),
      name: config.name,
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      pass: config.pass,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
      isDefault: config.isDefault,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }));
  }

  async updateSMTPConfig(configId: string, userId: string, updates: any) {
    const db = await this.connect();
    
    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await db.collection('smtpConfigs').updateMany(
        { userId: new ObjectId(userId) },
        { $set: { isDefault: false } }
      );
    }

    await db.collection('smtpConfigs').updateOne(
      { _id: new ObjectId(configId), userId: new ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async deleteSMTPConfig(configId: string, userId: string) {
    const db = await this.connect();
    await db.collection('smtpConfigs').deleteOne({
      _id: new ObjectId(configId),
      userId: new ObjectId(userId)
    });
  }

  async getDefaultSMTPConfig(userId: string) {
    const db = await this.connect();
    const config = await db.collection('smtpConfigs').findOne({
      userId: new ObjectId(userId),
      isDefault: true
    });

    if (!config) return null;

    return {
      id: config._id.toString(),
      name: config.name,
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      pass: config.pass,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
      isDefault: config.isDefault
    };
  }

  // Scheduled Jobs Management
  async createScheduledJob(userId: string, jobData: any) {
    const db = await this.connect();
    const result = await db.collection('scheduledJobs').insertOne({
      userId: new ObjectId(userId),
      ...jobData,
      status: 'scheduled',
      createdAt: new Date()
    });

    return result.insertedId.toString();
  }

  async getScheduledJobs(userId: string) {
    const db = await this.connect();
    const jobs = await db.collection('scheduledJobs')
      .find({ userId: new ObjectId(userId) })
      .sort({ scheduledTime: -1 })
      .toArray();

    return jobs.map(job => ({
      id: job._id.toString(),
      ...job,
      userId: job.userId.toString()
    }));
  }

  async updateScheduledJob(jobId: string, updates: any) {
    const db = await this.connect();
    await db.collection('scheduledJobs').updateOne(
      { _id: new ObjectId(jobId) },
      { $set: updates }
    );
  }

  async deleteScheduledJob(jobId: string, userId: string) {
    const db = await this.connect();
    await db.collection('scheduledJobs').deleteOne({
      _id: new ObjectId(jobId),
      userId: new ObjectId(userId)
    });
  }

  // Email Logs Management
  async saveEmailLog(userId: string, log: any) {
    const db = await this.connect();
    await db.collection('emailLogs').insertOne({
      userId: new ObjectId(userId),
      ...log,
      timestamp: new Date()
    });
  }

  async getEmailLogs(userId: string, limit = 100) {
    const db = await this.connect();
    const logs = await db.collection('emailLogs')
      .find({ userId: new ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return logs.map(log => ({
      id: log._id.toString(),
      ...log,
      userId: log.userId.toString()
    }));
  }

  async clearEmailLogs(userId: string) {
    const db = await this.connect();
    const result = await db.collection('emailLogs').deleteMany({
      userId: new ObjectId(userId)
    });
    return result.deletedCount;
  }

  async getEmailStats(userId: string) {
    const db = await this.connect();
    const logs = await db.collection('emailLogs')
      .find({ userId: new ObjectId(userId) })
      .toArray();

    const total = logs.length;
    const sent = logs.filter(log => log.status === 'Sent').length;
    const failed = logs.filter(log => log.status === 'Failed' || log.status === 'Error').length;

    return {
      total,
      sent,
      failed,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0'
    };
  }

  async close() {
    await this.client.close();
  }
}

export const mongoDatabase = new MongoDatabase();
