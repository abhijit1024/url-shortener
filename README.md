# URL Shortener

A full-stack URL shortener application built with FastAPI and React.

## Features

- Shorten long URLs into compact, shareable links
- Fast redirection to original URLs
- Modern, responsive UI
- One-click copy to clipboard
- Beautiful gradient design with animations

## Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping
- **SQLite** - Lightweight database
- **Uvicorn** - ASGI server

### Frontend  
- **React** - JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Modern CSS** - Responsive design with animations

## Prerequisites

Before running this project, make sure you have:

- **Python 3.8+** installed
- **Node.js 16+** and **npm** installed
- **Git** for cloning the repository

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node.js dependencies
npm install
```

## Running the Application

You need to run both the backend and frontend servers simultaneously.

### Terminal 1: Start the Backend Server

```bash
# From the backend directory
cd backend

# Activate virtual environment if not already active
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at: `http://localhost:8000`

### Terminal 2: Start the Frontend Development Server

```bash
# From the frontend directory
cd frontend

# Start the React development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Enter a long URL in the input field
3. Click "Shorten URL" to generate a short link
4. Copy the shortened URL or click "Visit" to test it
5. The shortened URL will redirect to the original URL

## API Endpoints

- `POST /shorten` - Create a shortened URL
- `GET /{short_code}` - Redirect to original URL

## Project Structure

```
url-shortener/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── database.py      # Database configuration
│   ├── models.py        # SQLAlchemy models
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main React component
│   │   ├── App.css      # Styling
│   │   └── main.jsx     # React entry point
│   ├── package.json     # Node.js dependencies
│   └── vite.config.js   # Vite configuration
└── README.md
```

## Development Notes

- The backend runs on port 8000 by default
- The frontend runs on port 5173 by default
- CORS is configured to allow requests from the frontend
- The SQLite database file (`url_shortener.db`) will be created automatically
- Hot reload is enabled for both backend and frontend during development

## Troubleshooting

### Backend Issues
- Ensure Python 3.8+ is installed
- Make sure virtual environment is activated
- Check that all dependencies are installed: `pip install -r requirements.txt`

### Frontend Issues
- Ensure Node.js 16+ is installed
- Delete `node_modules` and run `npm install` again if needed
- Check that the backend is running on port 8000

### CORS Issues
- Make sure both servers are running on the correct ports
- Backend should be on `http://localhost:8000`
- Frontend should be on `http://localhost:5173`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
