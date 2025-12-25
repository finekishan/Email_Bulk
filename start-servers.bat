@echo off
echo Starting Bulk Email Sender Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0 && npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul