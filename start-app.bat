@echo off
echo 🚀 Starting Bulk Email Sender Application
echo.

REM Kill any existing processes on ports 3000 and 5173
echo 🔄 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo 📦 Installing backend dependencies...
cd /d "c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main"
call npm install

echo.
echo 📦 Installing frontend dependencies...
cd /d "c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main\frontend"
call npm install

echo.
echo 🚀 Starting backend server...
cd /d "c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main"
start "Backend Server" cmd /k "npm run dev"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎨 Starting frontend server...
cd /d "c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main\frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ⏳ Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo ✅ Application started successfully!
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:3000
echo.
echo 📝 Test endpoints:
echo    http://localhost:3000/health
echo    http://localhost:5173/test
echo.
echo Press any key to open the application in browser...
pause >nul

start http://localhost:5173

echo.
echo 🎉 Application is running!
echo Keep both terminal windows open.
pause