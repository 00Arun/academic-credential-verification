@echo off
REM Academic Credential Verification System Startup Script for Windows
REM This script will start all necessary services for the system

echo 🚀 Starting Academic Credential Verification System...
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo 🔧 Starting local blockchain network...
echo    This will start a local Hardhat network on http://localhost:8545
echo.

REM Start Hardhat network in background
start "Hardhat Network" cmd /c "npm run node"

REM Wait a moment for the network to start
timeout /t 5 /nobreak >nul

echo 📋 Deploying smart contract...
npm run deploy

echo 🌐 Starting frontend application...
echo    Frontend will be available at http://localhost:3000
echo.

REM Start frontend in background
start "Frontend" cmd /c "cd frontend && npm start"

echo 🎉 System is starting up!
echo ==================================================
echo 📱 Frontend: http://localhost:3000
echo ⛓️  Blockchain: http://localhost:8545
echo.
echo Services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause
