# 🔧 Troubleshooting Guide - Internal Error 500

## Quick Fix Steps

### 1. **Check if servers are running**
```bash
# Backend should be running on port 3000
# Frontend should be running on port 5173
```

### 2. **Start Backend Server**
```bash
cd "c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main"
npm install
npm run dev
```

### 3. **Start Frontend Server (in new terminal)**
```bash
cd "c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main\frontend"
npm install
npm run dev
```

## Common Issues & Solutions

### ❌ "Endpoint not found" Error
**Cause**: Frontend trying to access non-existent backend endpoints
**Solution**: 
- Ensure backend is running on port 3000
- Check that frontend .env has correct API URL: `VITE_API_URL=http://localhost:3000`

### ❌ MongoDB Connection Issues
**Cause**: Invalid MongoDB URI or network issues
**Solution**:
1. Check `.env` file has correct `MONGODB_URI`
2. Test connection: `node test-connection.js`
3. Verify MongoDB Atlas IP whitelist includes your IP

### ❌ CORS Errors
**Cause**: Frontend and backend on different origins
**Solution**: Backend CORS is configured for `http://localhost:5173`

### ❌ Authentication Issues
**Cause**: Session token not being set/read properly
**Solution**: 
- Clear browser cookies
- Check if session_token cookie is being set
- Verify auth middleware is working

## Available Endpoints

### Backend API (http://localhost:3000)
- `GET /` - API info
- `GET /health` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `GET /user/info` - Get user info (authenticated)

### Frontend (http://localhost:5173)
- `/` - Redirects to login
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard (authenticated)

## Environment Files

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://finekk1234_db_user:jVmodj958uYHKdIx@email.mtueibn.mongodb.net/?appName=Email
MONGODB_DB_NAME=bulk_email_sender
PORT=3000
SESSION_SECRET=your-secure-random-string-change-this-in-production
```

### Frontend (frontend/.env)
```env
VITE_API_URL=http://localhost:3000
```

## Testing Steps

1. **Test Backend Health**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"OK","timestamp":"...","version":"2.0.0-mongodb"}`

2. **Test MongoDB Connection**
   ```bash
   node test-connection.js
   ```

3. **Test Registration**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
   ```

4. **Access Frontend**
   - Open http://localhost:5173
   - Should redirect to login page
   - Try registering a new account

## If Still Having Issues

1. **Check browser console** for JavaScript errors
2. **Check backend terminal** for error messages
3. **Clear browser cache and cookies**
4. **Restart both servers**
5. **Check Windows Firewall** isn't blocking ports 3000/5173

## Success Indicators

✅ Backend shows: "Server starting on port 3000"
✅ Frontend shows: "Local: http://localhost:5173"
✅ No CORS errors in browser console
✅ Login page loads without errors
✅ Can register new user successfully