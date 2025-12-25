@echo off
echo 🚀 Starting Simple Bulk Email Sender
echo.

cd /d "c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main"

echo 📦 Installing dependencies...
npm install hono @hono/node-server mongodb argon2 dotenv

echo.
echo 🚀 Starting backend server...
start "Backend" cmd /k "node simple-server.js"

echo.
echo ⏳ Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Opening frontend...
start simple-frontend.html

echo.
echo ✅ Application started!
echo.
echo 📍 URLs:
echo   Backend: http://localhost:3000
echo   Frontend: simple-frontend.html (opened in browser)
echo.
echo 🧪 Test:
echo   1. Register a new user
echo   2. Login with the user
echo   3. Check MongoDB Atlas for data
echo.
pause