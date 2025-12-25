@echo off
echo 🎨 Starting Frontend Server
echo.

cd /d "c:\Users\Kishan Kesharwani\Desktop\ai_iampro2\assignment-main\assignment-main\frontend"

echo 📦 Installing dependencies...
npm install

echo.
echo 🚀 Starting development server...
echo Frontend will be available at: http://localhost:5173
echo.
echo Test pages:
echo - http://localhost:5173/test (routing test)
echo - http://localhost:5173/login (login page)
echo - http://localhost:5173/register (register page)
echo.

npm run dev