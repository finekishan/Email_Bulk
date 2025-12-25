# 🚀 Bulk Email Sender - SvelteKit + MongoDB

A modern, full-stack bulk email sender application built with **SvelteKit** (frontend) and **Hono** (backend) using **MongoDB Atlas** for data persistence.

## ✅ Project Status: COMPLETED

All assignment objectives have been successfully completed!

### Current Tech Stack
- **Backend**: Hono + Node.js (migrated from Bun)
- **Frontend**: SvelteKit + TypeScript
- **Database**: MongoDB Atlas (migrated from SQLite)
- **Authentication**: Argon2 password hashing with session tokens
- **Email**: Nodemailer with SMTP (ready to implement)

---

## 🎯 Completed Features

### ✅ 1. SvelteKit Frontend
- ✅ Modern, clean UI with gradient design
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Client-side validation and error handling
- ✅ Toast notifications for user feedback
- ✅ Protected routes with authentication

### ✅ 2. Authentication System
- ✅ User registration with validation
- ✅ Secure login with Argon2 hashing
- ✅ Session management with HTTP-only cookies
- ✅ Auto-redirect for protected routes
- ✅ Logout functionality

### ✅ 3. SMTP Configuration
- ✅ Add/Edit/Delete SMTP configs
- ✅ Multiple SMTP accounts per user
- ✅ Set default configuration
- ✅ Secure password storage in MongoDB

### ✅ 4. Dashboard
- ✅ Statistics cards (Total, Success Rate, Failed, Scheduled)
- ✅ Quick action buttons
- ✅ User profile display
- ✅ Navigation sidebar

### ✅ 5. Reports & Analytics
- ✅ Email logs table
- ✅ Statistics display
- ✅ Clear logs functionality
- ✅ Status badges (Sent/Failed)

### ✅ 6. Database Migration
- ✅ Migrated from SQLite to MongoDB Atlas
- ✅ User management
- ✅ Session storage
- ✅ SMTP configurations
- ✅ Email logs
- ✅ Automatic collection creation

### ✅ 8. Email Sending (NEW!)
- ✅ Excel file upload for contacts
- ✅ Rich text editor (Quill) for email composition
- ✅ Variable replacement ({{FirstName}}, {{LastName}}, etc.)
- ✅ Delay configuration between emails
- ✅ Bulk email sending with progress tracking
- ✅ Email logs saved to MongoDB
- ✅ Migrated from Bun to Node.js
- ✅ Updated all dependencies
- ✅ Removed Bun-specific code
- ✅ CORS configured for SvelteKit
- ✅ API routes working

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd assignment-main/assignment-main
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB Atlas credentials
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Environment Configuration

**Backend (.env):**
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Email
MONGODB_DB_NAME=bulk_email_sender

# Server
PORT=3000
SESSION_SECRET=your-secure-random-string

# SMTP (Optional - users can configure their own)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend (frontend/.env):**
```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Running the Application

### Start Backend
```bash
npm run dev
```
Backend runs on: http://localhost:3000

### Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

---

## 📱 Using the Application

### 1. Register Account
- Open http://localhost:5173
- Click "Register here"
- Enter name, email, password (min 6 characters)
- Click "Register"

### 2. Configure SMTP
- Go to "⚙️ SMTP Config"
- Click "+ Add New Config"
- Enter SMTP details:
  - **Gmail**: smtp.gmail.com:587 (use App Password)
  - **Outlook**: smtp-mail.outlook.com:587
  - **Custom**: Your SMTP server details
- Click "Save Configuration"

### 3. Send Emails
- Go to "📧 Send Emails"
- Upload Excel file with contacts (Email, FirstName, LastName, Company columns)
- Enter email subject (use {{FirstName}}, {{Company}} for personalization)
- Compose email using rich text editor
- Set delay between emails (default: 2 seconds)
- Click "Send Emails"
- View progress in Reports

### 4. View Reports
- Go to "📈 Reports"
- View email logs and statistics
- Export or clear logs

---

## 🗄️ Database Schema

### Collections (Auto-created)

**users**
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

**sessions**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  token: String (unique),
  expiresAt: Date,
  createdAt: Date
}
```

**smtpConfigs**
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

**emailLogs**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  email: String,
  status: String,
  message: String,
  timestamp: Date,
  subject: String
}
```

---

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
- `POST /config/smtp/:id/default` - Set as default

### Email Sending
- `POST /send` - Send bulk emails with Excel file
- `GET /send/batch-status` - Get batch status

### Reports
- `GET /report` - Get email logs and stats
- `DELETE /report/clear` - Clear all logs

### Dashboard
- `GET /dashboard/poll-status` - Check polling status
- `GET /dashboard/stats` - Get dashboard statistics

### API Documentation
- `GET /api-docs` - Swagger UI for interactive API testing
- `GET /swagger.json` - OpenAPI specification

---

## 🎨 Project Structure

```
assignment-main/
├── src/                          # Backend
│   ├── app.ts                   # Main app entry
│   ├── types.ts                 # TypeScript types
│   ├── middleware/
│   │   └── auth.ts             # Auth middleware
│   ├── routes/
│   │   ├── auth.ts             # Auth routes
│   │   ├── config.ts           # SMTP config routes
│   │   ├── send.ts             # Email sending routes
│   │   ├── report.ts           # Reports routes
│   │   └── dashboard.ts        # Dashboard routes
│   └── services/
│       └── mongoDatabase.ts    # MongoDB service
├── frontend/                    # SvelteKit Frontend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.svelte
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   ├── send/
│   │   │   ├── config/
│   │   │   └── reports/
│   │   └── lib/
│   │       ├── api/            # API client
│   │       ├── stores/         # Svelte stores
│   │       └── components/     # UI components
│   └── static/
├── uploads/                     # Uploaded files
├── logs/                        # Email logs
├── .env                         # Environment variables
└── package.json
```

---

## 🔒 Security Features

- ✅ Argon2 password hashing
- ✅ HTTP-only session cookies
- ✅ CORS protection
- ✅ Input validation
- ✅ MongoDB injection prevention
- ✅ Secure session management

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### MongoDB Connection Failed
- Check MongoDB Atlas connection string
- Verify IP whitelist in Atlas
- Ensure username/password are correct

### CORS Errors
- Verify frontend URL in backend CORS config
- Check credentials: 'include' in API calls

---

## 🎉 Success Indicators

✅ Backend running on Node.js with MongoDB Atlas
✅ Frontend running on SvelteKit
✅ User authentication working
✅ SMTP configuration management working
✅ **Email sending with Excel upload working**
✅ **Rich text editor (Quill) integrated**
✅ **Variable replacement working**
✅ Reports displaying correctly
✅ Responsive design
✅ No old frontend code (public/ folder removed)
✅ All API endpoints functional
✅ **Swagger UI available at /api-docs for API testing**

## 📝 What's Next (Optional Enhancements)

1. Email scheduling for future delivery
2. Batch processing with configurable batch sizes
3. Email templates library
4. Advanced analytics and charts
5. Export reports as CSV/PDF

---

## 📄 License

MIT License

---

**Built with ❤️ using SvelteKit, Hono, and MongoDB Atlas**
