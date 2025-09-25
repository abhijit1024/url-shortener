#!/usr/bin/env python3
import sys
import os
import tempfile
sys.path.append(os.path.dirname(__file__))

try:
    from sqlalchemy import create_engine, Column, Integer, String, DateTime, func
    from sqlalchemy.orm import declarative_base
    from sqlalchemy.orm import sessionmaker

    # Create engine in temp directory
    db_path = os.path.join(tempfile.gettempdir(), "url_shortener.db")
    DATABASE_URL = f"sqlite:///{db_path}"
    print(f"Using database: {DATABASE_URL}")

    engine = create_engine(DATABASE_URL, echo=True)
    Base = declarative_base()

    class URL(Base):
        __tablename__ = "urls"

        id = Column(Integer, primary_key=True, index=True)
        short_code = Column(String, unique=True, index=True)
        original_url = Column(String, nullable=False)
        click_count = Column(Integer, default=0)
        created_at = Column(DateTime, server_default=func.now())
        last_accessed = Column(DateTime, nullable=True)

    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
