@echo off
echo 🚀 Starting Bulk Email Sender Application
echo.

echo 📋 Checking environment...
if not exist ".env" (
    echo ❌ .env file not found
    echo Please copy .env.example to .env and configure it
    pause
    exit /b 1
)

echo ✅ .env file found

echo.
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔗 Testing MongoDB connection...
node test-connection.js
if errorlevel 1 (
    echo ❌ MongoDB connection failed
    echo Please check your MONGODB_URI in .env file
    pause
    exit /b 1
)

echo.
echo 🖥️ Starting backend server...
echo Backend will run on http://localhost:3000
echo.
echo To start frontend (in another terminal):
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev