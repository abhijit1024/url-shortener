from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import secrets
import json

from database import SessionLocal, engine
from models import Base, URL

app = FastAPI(title="URL Shortener API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600
)

# Create tables
Base.metadata.create_all(bind=engine)

class URLRequest(BaseModel):
    original_url: str
    custom_alias: Optional[str] = None

class URLResponse(BaseModel):
    id: int
    original_url: str
    short_code: str
    created_at: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# URL endpoints
@app.post("/shorten")
def shorten_url(
    request: URLRequest, 
    db: Session = Depends(get_db)
):
    # Check if URL already exists and no custom alias is provided
    if not request.custom_alias:
        existing_url = db.query(URL).filter(URL.original_url == request.original_url).first()
        if existing_url:
            return {
                "short_url": f"http://localhost:8000/{existing_url.short_code}",
                "short_code": existing_url.short_code
            }
        
        # Generate a random short code if no custom alias is provided
        while True:
            short_code = secrets.token_urlsafe(4)
            if not db.query(URL).filter(URL.short_code == short_code).first():
                break
    else:
        # Validate custom alias format
        if not request.custom_alias.isalnum():
            raise HTTPException(
                status_code=400,
                detail="Custom alias can only contain letters and numbers"
            )
        if len(request.custom_alias) < 3 or len(request.custom_alias) > 20:
            raise HTTPException(
                status_code=400,
                detail="Custom alias must be between 3 and 20 characters long"
            )
        
        # Check if the exact alias exists for the same URL
        existing_url = db.query(URL).filter(
            URL.original_url == request.original_url,
            URL.short_code == request.custom_alias
        ).first()
        
        if existing_url:
            return {
                "short_url": f"http://localhost:8000/{existing_url.short_code}",
                "short_code": existing_url.short_code
            }
        
        # If the exact alias exists for a different URL, find a unique one
        base_alias = request.custom_alias
        counter = 1
        short_code = base_alias
        
        while db.query(URL).filter(URL.short_code == short_code).first() is not None:
            # Keep the alias under 20 characters
            suffix = str(counter)
            if len(base_alias) + len(suffix) > 20:
                # If adding the counter would exceed 20 chars, truncate the base alias
                base_alias = base_alias[:20 - len(suffix)]
            short_code = f"{base_alias}{suffix}"
            counter += 1
    
    # Create and save the URL
    db_url = URL(
        original_url=request.original_url, 
        short_code=short_code
    )
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    
    return {
        "short_url": f"http://localhost:8000/{short_code}",
        "short_code": short_code
    }

@app.get("/{short_code}")
def redirect_to_url(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(URL.short_code == short_code).first()
    if db_url is None:
        raise HTTPException(status_code=404, detail="URL not found")
    
    return RedirectResponse(url=db_url.original_url)

@app.get("/api/history", response_model=List[dict])
async def get_history(db: Session = Depends(get_db)):
    urls = db.query(URL).order_by(desc(URL.created_at)).all()
    return [{
        "id": url.id,
        "original_url": url.original_url,
        "short_code": url.short_code,
        "short_url": f"http://localhost:8000/{url.short_code}",
        "created_at": url.created_at.isoformat() if url.created_at else None
    } for url in urls]

@app.get("/api/url/{short_code}")
async def get_url(short_code: str, db: Session = Depends(get_db)):
    url = db.query(URL).filter(URL.short_code == short_code).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    return {
        "original_url": url.original_url,
        "short_code": url.short_code,
        "short_url": f"http://localhost:8000/{url.short_code}",
        "created_at": url.created_at.isoformat() if url.created_at else None
    }
