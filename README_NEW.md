# 🚀 Bulk Email Sender - SvelteKit + MongoDB

A modern, full-stack bulk email sender application built with **SvelteKit** (frontend) and **Hono** (backend) using **MongoDB** for data persistence.

## 📋 Features

- ✅ **User Authentication** - Secure registration and login with Argon2 password hashing
- ✅ **SMTP Configuration** - Manage multiple SMTP accounts per user
- ✅ **Bulk Email Sending** - Send emails to multiple recipients with Excel import
- ✅ **Rich Text Editor** - WYSIWYG email composer with Quill
- ✅ **Batch Processing** - Send emails in batches with configurable delays
- ✅ **Email Scheduling** - Schedule emails for future delivery
- ✅ **Real-time Progress** - Track email sending progress in real-time
- ✅ **Reports & Analytics** - View email logs and statistics
- ✅ **Responsive Design** - Mobile-friendly UI

## 🛠️ Tech Stack

### Frontend
- **SvelteKit** - Modern web framework
- **TypeScript** - Type-safe development
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Quill** - Rich text editor

### Backend
- **Hono** - Fast web framework
- **Node.js** - Runtime environment
- **MongoDB** - NoSQL database
- **Nodemailer** - Email sending
- **Argon2** - Password hashing
- **Multer** - File uploads

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **MongoDB** (local or cloud instance)

### Installing MongoDB

#### Windows
1. Download MongoDB from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB service: `net start MongoDB`

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Using MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd assignment-main/assignment-main
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Create .env file (if not exists)
cp .env.example .env

# Edit .env file and configure:
# - MONGODB_URI (your MongoDB connection string)
# - SMTP settings (optional, users can configure their own)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000" > .env
```

### 4. Environment Configuration

Edit the `.env` file in the root directory:

```env
# Server settings
PORT=3000
SESSION_SECRET=your_secure_random_secret_key_here

# MongoDB settings
MONGODB_URI=mongodb://localhost:27017/bulk-email-sender

# Optional: Default SMTP settings (users can configure their own)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
FROM_EMAIL=your@email.com
FROM_NAME=Your Name
```

## 🎯 Running the Application

### Development Mode

#### Terminal 1 - Backend
```bash
# From root directory
npm run dev
```

Backend will start on `http://localhost:3000`

#### Terminal 2 - Frontend
```bash
# From frontend directory
cd frontend
npm run dev
```

Frontend will start on `http://localhost:5173`

### Production Mode

#### Build Backend
```bash
npm run build
npm start
```

#### Build Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📱 Usage Guide

### 1. Register an Account
1. Navigate to `http://localhost:5173`
2. Click "Register here"
3. Fill in your details (name, email, password)
4. Click "Register"

### 2. Configure SMTP
1. After login, go to "SMTP Config"
2. Click "Add New Configuration"
3. Enter your SMTP details:
   - **Gmail**: Use App Password (not regular password)
   - **Outlook**: Enable SMTP in settings
   - **Custom**: Enter your SMTP server details
4. Test the connection
5. Set as default

### 3. Send Bulk Emails
1. Go to "Send Emails"
2. Upload Excel file with contacts (columns: Email, FirstName, LastName, Company)
3. Compose your email using the rich text editor
4. Use variables: `{{FirstName}}`, `{{LastName}}`, `{{Email}}`, `{{Company}}`
5. Configure batch settings (optional)
6. Click "Send" or "Schedule"

### 4. View Reports
1. Go to "Reports"
2. View email logs and statistics
3. Export logs as CSV or JSON
4. Filter by status or date range

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### SMTP Configuration
- `GET /config/smtp` - Get all user SMTP configs
- `POST /config/smtp` - Create new SMTP config
- `PUT /config/smtp/:id` - Update SMTP config
- `DELETE /config/smtp/:id` - Delete SMTP config
- `POST /config/smtp/:id/test` - Test SMTP connection

### Email Sending
- `POST /send` - Send emails (immediate/batch/scheduled)
- `POST /send/preview` - Preview email
- `GET /send/status` - Get batch status
- `POST /send/pause` - Pause batch job
- `POST /send/resume` - Resume batch job
- `POST /send/cancel` - Cancel batch job

### Reports
- `GET /report` - Get email logs and stats
- `GET /report/export/csv` - Export logs as CSV
- `GET /report/export/json` - Export logs as JSON
- `DELETE /report/clear` - Clear all logs

### Dashboard
- `GET /dashboard/poll-status` - Check if polling needed
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/scheduled-jobs` - Get scheduled jobs

## 🗄️ Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  passwordHash: String,
  createdAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

#### sessions
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  token: String (unique),
  expiresAt: Date,
  createdAt: Date
}
```

#### smtpConfigs
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  host: String,
  port: Number,
  secure: Boolean,
  user: String,
  pass: String,
  fromEmail: String,
  fromName: String,
  isDefault: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### scheduledJobs
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  emailJob: Object,
  batchConfig: Object,
  scheduledTime: Date,
  notifyEmail: String,
  notifyBrowser: Boolean,
  status: String,
  createdAt: Date,
  startedAt: Date,
  completedAt: Date,
  contactCount: Number,
  subject: String,
  useBatch: Boolean,
  configName: String
}
```

#### emailLogs
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  email: String,
  status: String,
  message: String,
  timestamp: Date,
  messageId: String,
  firstName: String,
  company: String,
  subject: String
}
```

## 🔒 Security Features

- **Password Hashing** - Argon2 for secure password storage
- **Session Management** - HTTP-only cookies with expiration
- **CORS Protection** - Configured for frontend origin
- **Input Validation** - Server-side validation for all inputs
- **MongoDB Injection Prevention** - Parameterized queries

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongodb
```

### CORS Errors
Ensure backend CORS is configured for frontend URL:
```typescript
app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
```

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
# Windows: netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F

# Kill process on port 5173 (frontend)
# Windows: netstat -ano | findstr :5173
# Then: taskkill /PID <PID> /F
```

## 📝 Development Notes

### Project Structure
```
assignment-main/
├── src/                    # Backend source
│   ├── app.ts             # Main app entry
│   ├── types.ts           # TypeScript types
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API routes
│   └── services/          # Business logic
├── frontend/              # SvelteKit frontend
│   ├── src/
│   │   ├── routes/       # Pages
│   │   └── lib/          # Components, stores, API
│   └── static/           # Static assets
├── uploads/              # Uploaded files
├── logs/                 # Email logs
└── .env                  # Environment variables
```

### Adding New Features
1. Backend: Add route in `src/routes/`
2. Frontend: Add page in `frontend/src/routes/`
3. API: Add function in `frontend/src/lib/api/`
4. Update types in `src/types.ts`

## 🚢 Deployment

### Backend (Node.js)
- **Heroku**, **Railway**, **Render**, **DigitalOcean**
- Set environment variables
- Ensure MongoDB is accessible

### Frontend (SvelteKit)
- **Vercel**, **Netlify**, **Cloudflare Pages**
- Set `VITE_API_URL` to production backend URL
- Install appropriate SvelteKit adapter

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
1. Check existing backend code for API behavior
2. Review types.ts for data structures
3. Test API endpoints with Postman/Thunder Client
4. Read SvelteKit docs for routing/forms
5. Use browser DevTools for debugging

---

**Built with ❤️ using SvelteKit and MongoDB**
