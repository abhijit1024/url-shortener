from fastapi import FastAPI, HTTPException, Depends, status, Request, Query, Response
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl, Field, validator, AnyUrl
from datetime import datetime, timedelta
import secrets
import time
import re
import logging
import uvicorn
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import database and models
from backend.database import SessionLocal, get_db, Base, engine
from backend.models import URL

# Security
oauth2_scheme = HTTPBearer(auto_error=False)  # Make authentication optional

# Rate limiting configuration
RATE_LIMIT = 100  # requests per window
RATE_LIMIT_WINDOW = 60  # seconds

# In-memory rate limit store (consider using Redis in production)
rate_limit_store: Dict[str, List[float]] = {}

def get_client_ip(request: Request) -> str:
    """Get client IP address from request."""
    if "x-forwarded-for" in request.headers:
        return request.headers["x-forwarded-for"].split(",")[0]
    return request.client.host if request.client else "127.0.0.1"

def check_rate_limit(ip: str) -> Dict[str, Any]:
    """Check if the request is within rate limits."""
    current_time = time.time()
    window_start = current_time - RATE_LIMIT_WINDOW
    
    # Clean up old entries
    if ip in rate_limit_store:
        rate_limit_store[ip] = [t for t in rate_limit_store[ip] if t > window_start]
    
    # Initialize if not exists
    if ip not in rate_limit_store:
        rate_limit_store[ip] = []
    
    # Check rate limit
    request_count = len(rate_limit_store[ip])
    if request_count >= RATE_LIMIT:
        return {
            "allowed": False,
            "remaining": 0,
            "reset_time": window_start + RATE_LIMIT_WINDOW
        }
    
    # Add current request
    rate_limit_store[ip].append(current_time)
    
    return {
        "allowed": True,
        "remaining": RATE_LIMIT - request_count - 1,
        "reset_time": window_start + RATE_LIMIT_WINDOW
    }

# Initialize FastAPI app
app = FastAPI(
    title="URL Shortener API",
    description="A secure and scalable URL shortening service with rate limiting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Security
oauth2_scheme = HTTPBearer(auto_error=False)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)

# Add GZip compression for responses
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Rate limiting configuration
RATE_LIMIT = 100  # requests per window
RATE_LIMIT_WINDOW = 60  # seconds

# In-memory rate limit store (consider using Redis in production)
rate_limit_store: Dict[str, List[float]] = {}

def get_client_ip(request: Request) -> str:
    """Get client IP address from request."""
    if "x-forwarded-for" in request.headers:
        return request.headers["x-forwarded-for"].split(",")[0]
    return request.client.host if request.client else "127.0.0.1"

def check_rate_limit(ip: str) -> Dict[str, Any]:
    """Check if the request is within rate limits."""
    current_time = time.time()
    window_start = current_time - RATE_LIMIT_WINDOW
    
    # Clean up old entries
    if ip in rate_limit_store:
        rate_limit_store[ip] = [t for t in rate_limit_store[ip] if t > window_start]
    
    # Initialize if not exists
    if ip not in rate_limit_store:
        rate_limit_store[ip] = []
    
    # Check rate limit
    request_count = len(rate_limit_store[ip])
    if request_count >= RATE_LIMIT:
        return {
            "allowed": False,
            "remaining": 0,
            "reset_time": window_start + RATE_LIMIT_WINDOW
        }
    
    # Add current request
    rate_limit_store[ip].append(current_time)
    
    return {
        "allowed": True,
        "remaining": RATE_LIMIT - request_count - 1,
        "reset_time": window_start + RATE_LIMIT_WINDOW
    }

# Add rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Skip rate limiting for docs and redoc
    if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
        
    client_ip = get_client_ip(request)
    rate_limit = check_rate_limit(client_ip)
    
    response = await call_next(request)
    
    # Add rate limit headers to response
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT)
    response.headers["X-RateLimit-Remaining"] = str(rate_limit["remaining"])
    response.headers["X-RateLimit-Reset"] = str(int(rate_limit["reset_time"] - time.time()))
    
    if not rate_limit["allowed"]:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests"},
            headers={
                "Retry-After": str(int(rate_limit["reset_time"] - time.time()))
            }
        )
    
    return response

# Add rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Skip rate limiting for docs and redoc
    if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
        
    client_ip = get_client_ip(request)
    rate_limit = check_rate_limit(client_ip)
    
    response = await call_next(request)
    
    # Add rate limit headers to response
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT)
    response.headers["X-RateLimit-Remaining"] = str(rate_limit["remaining"])
    response.headers["X-RateLimit-Reset"] = str(int(rate_limit["reset_time"] - time.time()))
    
    if not rate_limit["allowed"]:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests"},
            headers={
                "Retry-After": str(int(rate_limit["reset_time"] - time.time()))
            }
        )
    
    return response
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Create tables
Base.metadata.create_all(bind=engine)

class URLRequest(BaseModel):
    original_url: str = Field(..., description="The original URL to be shortened")
    custom_alias: Optional[str] = Field(
        None,
        min_length=3,
        max_length=20,
        pattern=r'^[a-zA-Z0-9_-]+$',
        description="Optional custom alias (3-20 chars, alphanumeric, underscores, hyphens)"
    )
    expires_in_days: Optional[int] = Field(
        None,
        ge=1,
        le=365,
        description="Number of days until the URL expires (1-365)"
    )

    @validator('original_url')
    def validate_url(cls, v):
        if not URL.validate_url(v):
            raise ValueError('Invalid URL format')
        return v

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    if not check_rate_limit(client_ip):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Please try again later."},
            headers={"Retry-After": str(RATE_LIMIT_WINDOW)}
        )
    response = await call_next(request)
    return response

@app.exception_handler(Exception)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )

@app.post("/shorten", response_model=dict, status_code=status.HTTP_201_CREATED)
async def shorten_url(
    request: URLRequest,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
):
    try:
        # In a real app, verify the token here
        # For now, we'll just log it
        print(f"Authenticated request with token: {credentials.credentials[:10]}...")

        # Check if URL is already shortened
        existing_url = db.query(URL).filter(URL.original_url == request.original_url).first()
        if existing_url and not request.custom_alias:
            return {
                "short_url": f"http://localhost:8000/{existing_url.short_code}",
                "already_exists": True
            }

        # Generate or validate short code
        if request.custom_alias:
            if not re.match(r'^[a-zA-Z0-9_-]{3,20}$', request.custom_alias):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Custom alias must be 3-20 characters long and contain only letters, numbers, underscores, or hyphens"
                )
            
            # Check if custom alias is already in use
            if db.query(URL).filter(URL.short_code == request.custom_alias).first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Custom alias already in use"
                )
            short_code = request.custom_alias
        else:
            # Generate a unique short code
            max_attempts = 5
            for _ in range(max_attempts):
                short_code = URL.generate_short_code()
                if not db.query(URL).filter(URL.short_code == short_code).first():
                    break
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate a unique short code"
                )
        
        # Set expiration if specified
        expires_at = None
        if request.expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)
        
        # Create URL record
        db_url = URL(
            short_code=short_code,
            original_url=request.original_url,
            expires_at=expires_at,
            is_active=True
        )
        
        db.add(db_url)
        db.commit()
        db.refresh(db_url)
        
        return {
            "short_url": f"http://localhost:8000/{short_code}",
            "expires_at": expires_at.isoformat() if expires_at else None,
            "already_exists": False
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error shortening URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )

@app.get("/{short_code}", response_class=RedirectResponse)
async def redirect_to_url(
    short_code: str, 
    db: Session = Depends(get_db),
    request: Request = None
):
    try:
        # Get URL from database
        db_url = db.query(URL).filter(URL.short_code == short_code).first()
        
        # Check if URL exists
        if not db_url:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="URL not found"
            )
        
        # Check if URL is active
        if not db_url.is_active:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This URL has been deactivated"
            )
        
        # Check if URL has expired
        if db_url.expires_at and datetime.utcnow() > db_url.expires_at:
            db_url.is_active = False
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This URL has expired"
            )
        
        # Update click count and last accessed time
        db_url.increment_click_count(db)
        
        # Log the access (in a real app, you might want to store more details)
        user_agent = request.headers.get('user-agent', 'unknown')
        referrer = request.headers.get('referer', 'direct')
        print(f"Redirect: {short_code} -> {db_url.original_url} (User-Agent: {user_agent}, Referrer: {referrer})")
        
        # Redirect to the original URL
        return db_url.original_url
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error redirecting URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )

