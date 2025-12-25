@echo off
echo Testing Backend API Endpoints...
echo.

echo Testing health endpoint...
curl -s http://localhost:3000/health
echo.
echo.

echo Testing root endpoint...
curl -s http://localhost:3000/
echo.
echo.

echo If you see JSON responses above, the backend is working correctly.
echo If you see connection errors, make sure the backend server is running.
echo.
pause