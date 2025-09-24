#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(__file__))

try:
    from sqlalchemy import create_engine, Column, Integer, String, DateTime
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker
    from datetime import datetime

    # Create engine
    db_path = os.path.join(os.path.dirname(__file__), "url_shortener.db")
    DATABASE_URL = f"sqlite:///{db_path}"
    engine = create_engine(DATABASE_URL, echo=True)

    Base = declarative_base()

    class URL(Base):
        __tablename__ = "urls"

        id = Column(Integer, primary_key=True, index=True)
        short_code = Column(String, unique=True, index=True)
        original_url = Column(String, nullable=False)
        click_count = Column(Integer, default=0)
        created_at = Column(DateTime, default=datetime.utcnow)
        last_accessed = Column(DateTime, nullable=True)

    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
