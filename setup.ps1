# URL Shortener Development Environment Setup for Windows
# Run this script in PowerShell with administrator privileges

Write-Host "🚀 Setting up URL Shortener development environment..." -ForegroundColor Cyan

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python is required but not installed. Please install Python 3.8+ and try again." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is required but not installed. Please install Node.js 16+ and try again." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is required but not installed. Please install npm and try again." -ForegroundColor Red
    exit 1
}

# Create and activate Python virtual environment
Write-Host "🐍 Setting up Python virtual environment..." -ForegroundColor Cyan
if (-not (Test-Path "venv")) {
    python -m venv venv
}
.\venv\Scripts\Activate.ps1

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

# Install Node.js dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Cyan
    Copy-Item .env.example -Destination .env
    Write-Host "ℹ️ Please update the .env file with your configuration." -ForegroundColor Yellow
}

# Create data directory for SQLite
Write-Host "🗄️ Setting up database..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "backend\data" | Out-Null

# Initialize database
Write-Host "🔧 Initializing database..." -ForegroundColor Cyan
Set-Location backend
python -c "from database import init_db; init_db()"
Set-Location ..

Write-Host "`n✨ Setup complete!" -ForegroundColor Green
Write-Host "`nTo start the development servers, run:" -ForegroundColor Cyan
Write-Host "1. Backend: cd backend; python run.py" -ForegroundColor Yellow
Write-Host "2. Frontend: cd frontend; npm run dev" -ForegroundColor Yellow
Write-Host "`n🌐 The application should be available at http://localhost:3000" -ForegroundColor Cyan
