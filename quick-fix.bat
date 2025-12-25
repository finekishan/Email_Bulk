@echo off
echo 🔧 Quick Fix for Bulk Email Sender
echo.

echo 📦 Installing missing dependencies...
npm install @types/node --save-dev

echo.
echo 🚀 Starting backend server...
echo Backend will be available at: http://localhost:3000
echo.
echo ⚠️  Keep this window open and start frontend in another terminal:
echo    cd frontend
echo    npm install
echo    npm run dev
echo.

npm run dev