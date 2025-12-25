@echo off
echo 🧪 Testing Backend Server
echo.

cd /d "c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main"

echo 🔗 Testing MongoDB connection...
node test-connection.js

echo.
echo 🚀 Starting backend server for 10 seconds...
timeout 10 npm run dev

echo.
echo ✅ Backend test completed!