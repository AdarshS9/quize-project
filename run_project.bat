@echo off
echo ========================================
echo Starting Online Exam Platform...
echo ========================================

:: Kill any existing processes on these ports
echo Cleaning up previous sessions...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1

:: Start the Backend Server
echo Starting Backend (Port 5000)...
start "ExamPro-Backend" cmd /k "node server/index.js || pause"

:: Start the Frontend Client
echo Starting Frontend (Port 5173)...
cd client
:: Using .cmd directly to bypass PowerShell execution policy issues
start "ExamPro-Frontend" cmd /k "node_modules\.bin\vite.cmd --host 127.0.0.1 || pause"

echo.
echo ========================================
echo Backend and Frontend are starting!
echo.
echo 1. Check the TWO black windows that just opened.
echo 2. If a window says "Access Denied", right-click this .bat and "Run as Administrator".
echo 3. Keep those black windows open while using the site!
echo.
echo Visit: http://127.0.0.1:5173
echo ========================================
pause
