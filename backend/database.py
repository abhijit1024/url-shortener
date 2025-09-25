from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# For Render PostgreSQL
if 'RENDER' in os.environ:
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    engine = create_engine(DATABASE_URL)
else:
    # For local SQLite
    SQLITE_PATH = "instance/url_shortener.db" if 'RENDER' in os.environ else "url_shortener.db"
    DATABASE_URL = f"sqlite:///{SQLITE_PATH}"
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(SQLITE_PATH), exist_ok=True)
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
