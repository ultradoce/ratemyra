#!/bin/bash

echo "🚀 RateMyRA Startup Script"
echo "=========================="
echo ""

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "❌ Server dependencies not installed"
    echo "📦 Installing dependencies..."
    npm run install:all
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Server dependencies installed"
fi

if [ ! -d "client/node_modules" ]; then
    echo "❌ Client dependencies not installed"
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install client dependencies"
        exit 1
    fi
else
    echo "✅ Client dependencies installed"
fi

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found. Creating from example..."
    cp server/.env.example server/.env
    echo "📝 Please edit server/.env with your database credentials"
fi

# Check if database is set up
echo ""
echo "📊 Checking database setup..."
cd server
if ! npm run db:generate > /dev/null 2>&1; then
    echo "⚠️  Prisma client not generated. Run: npm run db:generate"
fi

echo ""
echo "✅ Ready to start!"
echo ""
echo "Starting servers..."
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd ..
npm run dev
