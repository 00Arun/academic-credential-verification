#!/bin/bash

# Academic Credential Verification System Startup Script
# This script will start all necessary services for the system

echo "🚀 Starting Academic Credential Verification System..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo "🔧 Starting local blockchain network..."
echo "   This will start a local Hardhat network on http://localhost:8545"
echo "   Press Ctrl+C to stop the network when done"
echo ""

# Start Hardhat network in background
npm run node &
HARDHAT_PID=$!

# Wait a moment for the network to start
sleep 5

echo "📋 Deploying smart contract..."
npm run deploy

echo "🌐 Starting frontend application..."
echo "   Frontend will be available at http://localhost:3000"
echo ""

# Start frontend in background
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "🎉 System is starting up!"
echo "=================================================="
echo "📱 Frontend: http://localhost:3000"
echo "⛓️  Blockchain: http://localhost:8545"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $HARDHAT_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait
