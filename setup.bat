@echo off
REM Event Planning System - Setup and Run Script for Windows

echo ================================
echo Event Planning System Setup
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js ^>= 16.x
    pause
    exit /b 1
)

echo Node.js version:
node --version

echo NPM version:
npm --version
echo.

REM Setup Backend
echo === Setting up Backend ===
cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

REM Seed database
echo Seeding database with sample data...
call npm run seed

echo.
echo Backend setup complete!
echo.

REM Go back to root
cd ..

REM Setup Frontend
echo === Setting up Frontend ===
cd frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo Frontend setup complete!
echo.

REM Go back to root
cd ..

echo ================================
echo Setup Complete!
echo ================================
echo.
echo To run the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend ^&^& npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo Demo Credentials:
echo   Admin:  admin@example.com / Admin@123
echo   User:   user@example.com / User@123
echo.
pause
