from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    short_code = Column(String, unique=True, index=True)
    original_url = Column(String, nullable=False)
    click_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    last_accessed = Column(DateTime, nullable=True)
