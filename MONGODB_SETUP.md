# ⚠️ MongoDB Connection Issue

## Problem
The MongoDB Atlas connection string in your `.env` file appears to be incorrect or the cluster doesn't exist.

## Solution: Get Your Correct MongoDB Atlas Connection String

### Step 1: Log into MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Log in with your credentials

### Step 2: Get Connection String
1. Click on "Database" in the left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver
5. Copy the connection string

### Step 3: Update .env File
Replace the `MONGODB_URI` in `.env` with your actual connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/bulk_email_sender?retryWrites=true&w=majority
```

**Example:**
```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/bulk_email_sender?retryWrites=true&w=majority
```

### Alternative: Use Local MongoDB

If you want to use local MongoDB instead:

```env
MONGODB_URI=mongodb://localhost:27017/bulk_email_sender
```

Then start local MongoDB:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

## Test Connection

After updating `.env`, test the connection:

```bash
node test-mongo.js
```

You should see:
```
✅ Connected to MongoDB successfully!
```

## Current Error
The hostnames in your provided connection strings don't resolve:
- `hono.gart76r.mongodb.net` - Not found
- `honoapp.zs02uzz.mongodb.net` - Not found

Please get the correct connection string from your MongoDB Atlas dashboard.
