from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    urls = relationship("URL", back_populates="owner")
    
    def __repr__(self):
        return f"<User(username='{self.username}')>"

class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    original_url = Column(String, index=True)
    short_code = Column(String, index=True)  # Removed unique constraint
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="urls")
    
    def __repr__(self):
        return f"<URL(original_url='{self.original_url}', short_code='{self.short_code}')>"
