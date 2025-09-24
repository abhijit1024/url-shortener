# URL Shortener

A full-stack URL shortener application built with FastAPI and React, featuring dark/light mode and custom aliases.

## ✨ Features

- **URL Shortening**: Convert long URLs into short, easy-to-share links
- **Custom Aliases**: Create personalized short URLs with custom endpoints
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Recent Links**: View and manage your recently shortened URLs
- **One-Click Copy**: Instantly copy shortened links to clipboard
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping
- **SQLite** - Lightweight database
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation and settings management
- **CORS Middleware** - For handling cross-origin requests

### Frontend  
- **React 18** - JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Modern CSS** - Responsive design with animations and transitions
- **Context API** - For state management
- **Clipboard API** - For one-click copy functionality

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

## 🔌 API Endpoints

### Create Short URL
- **Endpoint**: `POST /shorten`
- **Request Body**:
  ```json
  {
    "original_url": "https://example.com/very/long/url",
    "custom_alias": "example" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "short_url": "http://localhost:8000/abc123"
  }
  ```

### Redirect to Original URL
- **Endpoint**: `GET /{short_code}`
- **Response**: 302 Redirect to the original URL

### Error Responses
- `400 Bad Request`: Invalid URL format or missing required fields
- `400 Bad Request`: Custom alias already in use
- `404 Not Found`: Short URL not found

## 📁 Project Structure

```
url-shortener/
├── backend/
│   ├── main.py          # FastAPI application and routes
│   ├── database.py      # Database configuration and session management
│   ├── models.py        # SQLAlchemy models and schemas
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main React component with routing
│   │   ├── App.css      # Global styles and theming
│   │   ├── main.jsx     # React entry point with providers
│   │   └── assets/      # Static assets and icons
│   ├── package.json     # Node.js dependencies and scripts
│   └── vite.config.js   # Vite configuration
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## 🚀 Development Notes

### Backend
- Runs on port 8000 by default
- CORS is configured to allow all origins in development
- SQLite database (`url_shortener.db`) is automatically created
- Hot reload enabled with `--reload` flag
- Debug mode provides detailed error messages

### Frontend
- Runs on port 5173 by default
- Uses Vite's fast refresh for instant updates
- Environment variables can be configured in `.env`
- Dark/light mode preference is saved to localStorage
- Responsive design tested on common screen sizes

### Environment Variables
Create a `.env` file in the root directory:
```env
# Backend
DATABASE_URL=sqlite:///./url_shortener.db

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

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

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository and create your feature branch
2. Set up the development environment
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```
3. Make your changes and test thoroughly
4. Ensure code quality:
   - Follow existing code style
   - Add/update tests if applicable
   - Update documentation
5. Submit a pull request with a clear description of changes


