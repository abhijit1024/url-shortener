from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import secrets
from database import SessionLocal, engine
from models import Base, URL

app = FastAPI(title="URL Shortener API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "url-shortener-iota-wine.vercel.app",  # Your Vercel frontend
        "https://url-shortener-n0rj.onrender.com"  # Your Render backend
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "X-Foo", "X-Bar"],
)

# Create tables
Base.metadata.create_all(bind=engine)

class URLRequest(BaseModel):
    original_url: str
    custom_alias: str = None  # Optional custom alias

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/shorten")
def shorten_url(request: URLRequest, db: Session = Depends(get_db)):
    try:
        print(f"Received request to shorten URL: {request.original_url}")
        
        # Use custom alias if provided, otherwise generate a random one
        if request.custom_alias:
            # Check if custom alias is already in use
            existing_url = db.query(URL).filter(URL.short_code == request.custom_alias).first()
            if existing_url:
                raise HTTPException(status_code=400, detail="Custom alias already in use")
            short_code = request.custom_alias
        else:
            short_code = secrets.token_urlsafe(6)
        
        db_url = URL(short_code=short_code, original_url=request.original_url)
        db.add(db_url)
        db.commit()
        db.refresh(db_url)
        
        response = {"short_url": f"http://localhost:8000/{short_code}"}
        print(f"Successfully shortened URL: {response}")
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Error shortening URL: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/{short_code}")
def redirect_to_url(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(URL.short_code == short_code).first()
    if db_url is None:
        raise HTTPException(status_code=404, detail="URL not found")
    
    return RedirectResponse(url=db_url.original_url)

