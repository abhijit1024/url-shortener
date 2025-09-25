#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up URL Shortener development environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm and try again."
    exit 1
fi

# Create and activate Python virtual environment
echo "🐍 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "ℹ️ Please update the .env file with your configuration."
fi

# Create data directory for SQLite
echo "🗄️ Setting up database..."
mkdir -p backend/data

# Initialize database
echo "🔧 Initializing database..."
cd backend
python -c "from database import init_db; init_db()"
cd ..

echo "✨ Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "1. Backend: cd backend && python run.py"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 The application should be available at http://localhost:3000"
