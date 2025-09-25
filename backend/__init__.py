"""
URL Shortener Backend Package

This package contains the FastAPI application and related modules for the URL shortener service.
"""

# Import and expose key components for easier access
from .database import Base, engine, SessionLocal, get_db
from .models import URL
from .main import app

__all__ = [
    'Base',
    'engine',
    'SessionLocal',
    'get_db',
    'URL',
    'app'
]
