from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from fastapi import HTTPException, status
import os
import sys
from pathlib import Path
from typing import Generator, Any

# Create data directory if it doesn't exist
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True, mode=0o755)  # Ensure proper permissions

# Database configuration
DB_PATH = DATA_DIR / "url_shortener.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Initialize global variables
engine = None
SessionLocal = None
Base = None

try:
    # Configure SQLAlchemy engine
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
        echo=False  # Set to True for SQL query logging
    )
    
    # Create a scoped session factory
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    SessionLocal = scoped_session(session_factory)
    
    # Base class for models - this needs to be defined before importing models
    Base = declarative_base()
    
    # Import models after Base is defined to avoid circular imports
    from . import models  # This will register the models with SQLAlchemy
    
    # Create tables if they don't exist
    def init_db():
        try:
            # Create all tables
            Base.metadata.create_all(bind=engine)
            print(f"Database initialized at {DB_PATH}")
        except Exception as e:
            print(f"Error initializing database: {e}", file=sys.stderr)
            raise
    
    # Dependency to get DB session
    def get_db() -> Generator:
        if SessionLocal is None:
            raise RuntimeError("Database not initialized. Call init_db() first.")
            
        db = SessionLocal()
        try:
            yield db
            db.commit()
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Database error: {e}", file=sys.stderr)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error"
            )
        finally:
            db.close()
    
    # Initialize the database when this module is imported
    init_db()
    
except Exception as e:
    print(f"Critical error initializing database: {e}", file=sys.stderr)
    raise
