from sqlalchemy import Column, Integer, String, DateTime, Boolean, event, DDL, Index
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import re
import secrets
import string
from urllib.parse import urlparse
from typing import Optional, TYPE_CHECKING

# Import Base from database to avoid circular imports
if TYPE_CHECKING:
    from sqlalchemy.orm import Session
    from .database import Base
    Base = Base  # For type checking
else:
    from .database import Base  # For runtime

class URL(Base):
    """URL model for storing shortened URLs"""
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    short_code = Column(String(20), unique=True, index=True, nullable=False)
    original_url = Column(String(2000), nullable=False)
    click_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    last_accessed = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    def __repr__(self) -> str:
        return f"<URL(short_code='{self.short_code}', original_url='{self.original_url}')>"

    @staticmethod
    def validate_url(url: str) -> bool:
        """
        Validate URL format
        
        Args:
            url: The URL to validate
            
        Returns:
            bool: True if URL is valid, False otherwise
        """
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except (ValueError, AttributeError):
            return False

    @staticmethod
    def generate_short_code(length: int = 6) -> str:
        """
        Generate a random short code
        
        Args:
            length: Length of the short code (default: 6)
            
        Returns:
            str: A random alphanumeric string
        """
        chars = string.ascii_letters + string.digits
        return ''.join(secrets.choice(chars) for _ in range(length))
        
    def is_expired(self) -> bool:
        """Check if the URL has expired"""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at
        
    def mark_accessed(self, db) -> None:
        """
        Update last accessed timestamp and increment click count
        
        Args:
            db: Database session
        """
        self.last_accessed = datetime.utcnow()
        self.click_count += 1
        db.add(self)
        db.commit()


# Add index on short_code for faster lookups
if not hasattr(URL, '__table_args__'):
    URL.__table_args__ = {'extend_existing': True}

# Create index on short_code after table creation
event.listen(
    URL.__table__,
    'after_create',
    DDL('CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code)')
)
