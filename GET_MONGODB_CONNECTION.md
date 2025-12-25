# 🔧 How to Get Your MongoDB Atlas Connection String

## The Problem
The connection string you provided has an invalid hostname: `honoapp.zs02uzz.mongodb.net`

This hostname doesn't exist, which means either:
1. The cluster was deleted
2. The hostname is incorrect
3. You need to create a new cluster

## Solution: Get the Correct Connection String

### Step 1: Login to MongoDB Atlas
Go to: https://cloud.mongodb.com/
Login with your credentials

### Step 2: Navigate to Your Cluster
1. Click "Database" in the left sidebar
2. You should see your cluster (or create a new one if none exists)

### Step 3: Get Connection String
1. Click the "Connect" button on your cluster
2. Select "Drivers" (or "Connect your application")
3. Choose:
   - Driver: **Node.js**
   - Version: **5.5 or later**
4. Copy the connection string

### Step 4: Update Connection String
The connection string will look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Or for standard connection:
```
mongodb://<username>:<password>@cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### Step 5: Replace in .env File
Update your `.env` file:
```env
MONGODB_URI=<your-actual-connection-string-here>
```

**Important:** 
- Replace `<username>` with: `finekk1234_db_user`
- Replace `<password>` with: `a64NAfJXuIdr9hPa`
- Add `/bulk_email_sender` before the `?` to specify the database name

Example:
```env
MONGODB_URI=mongodb+srv://finekk1234_db_user:a64NAfJXuIdr9hPa@cluster0.abc123.mongodb.net/bulk_email_sender?retryWrites=true&w=majority
```

## Alternative: Create a New Free Cluster

If you don't have a cluster:

1. Go to https://cloud.mongodb.com/
2. Click "Build a Database"
3. Choose "FREE" (M0 Sandbox)
4. Select a cloud provider and region
5. Click "Create"
6. Wait for cluster to be created (2-3 minutes)
7. Create a database user:
   - Username: `finekk1234_db_user`
   - Password: `a64NAfJXuIdr9hPa`
8. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
9. Get the connection string as described above

## For Now: Use Local MongoDB

The application is currently configured to use local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/bulk_email_sender
```

This works if you have MongoDB installed locally. To start it:
```bash
# Windows
net start MongoDB

# Check if it's running
mongosh
```

## Test Your Connection

After updating `.env`, run:
```bash
node test-atlas.js
```

You should see:
```
✅ Connected to MongoDB Atlas successfully!
```
