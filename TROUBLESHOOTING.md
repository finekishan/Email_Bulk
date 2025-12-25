# 🔧 Troubleshooting Guide - Navigation Issues

## Problem: Clicking navigation links doesn't reflect/load pages

### Quick Fix Steps:

1. **Start Both Servers**
   ```bash
   # Terminal 1 - Backend
   cd c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main
   npm run dev
   
   # Terminal 2 - Frontend  
   cd c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main\frontend
   npm run dev
   ```

2. **Or use the batch file:**
   - Double-click `start-servers.bat` in the project root

3. **Test Backend API:**
   - Double-click `test-backend.bat` to verify backend is working
   - Or visit: http://localhost:3000/health

4. **Access Frontend:**
   - Open: http://localhost:5173
   - Login/Register first
   - Then navigate to dashboard

### Common Issues & Solutions:

#### Issue 1: Backend Not Running
**Symptoms:** Navigation works but no data loads, API errors in console
**Solution:** 
```bash
cd c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main
npm run dev
```

#### Issue 2: Frontend Not Running  
**Symptoms:** Page doesn't load at all
**Solution:**
```bash
cd c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main\frontend
npm run dev
```

#### Issue 3: Port Conflicts
**Symptoms:** "Port already in use" errors
**Solution:**
```bash
# Kill processes on ports
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>

netstat -ano | findstr :5173  
taskkill /F /PID <PID_NUMBER>
```

#### Issue 4: Authentication Issues
**Symptoms:** Redirected to login page constantly
**Solution:**
1. Clear browser cookies for localhost
2. Register a new account
3. Login and try navigation again

#### Issue 5: CORS Issues
**Symptoms:** Network errors in browser console
**Solution:** Backend already configured for CORS, but ensure both servers are running

### Verification Steps:

1. **Backend Health Check:**
   - Visit: http://localhost:3000/health
   - Should return: `{"status":"OK","timestamp":"...","version":"2.0.0-mongodb"}`

2. **Frontend Loading:**
   - Visit: http://localhost:5173
   - Should redirect to login page

3. **Navigation Test:**
   - Login/Register
   - Go to dashboard
   - Click navigation links (Send Emails, SMTP Config, Reports)
   - Pages should load with proper content

### Debug Console Commands:

Open browser console (F12) and check for:
- Network errors (red entries in Network tab)
- JavaScript errors (red entries in Console tab)
- Failed API calls

### Expected URLs:
- Backend API: http://localhost:3000
- Frontend: http://localhost:5173
- Dashboard: http://localhost:5173/dashboard
- Send Emails: http://localhost:5173/send
- SMTP Config: http://localhost:5173/config
- Reports: http://localhost:5173/reports

### If Still Not Working:

1. **Clear Browser Cache:**
   - Ctrl+Shift+Delete
   - Clear all data for localhost

2. **Restart Everything:**
   - Close all terminals
   - Run `start-servers.bat` again

3. **Check Dependencies:**
   ```bash
   # Backend
   npm install
   
   # Frontend
   cd frontend
   npm install
   ```

4. **Check MongoDB Connection:**
   - Verify .env file has correct MongoDB URI
   - Test connection by starting backend and checking logs