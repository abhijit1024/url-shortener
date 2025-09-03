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
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

class URLRequest(BaseModel):
    original_url: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/shorten")
def shorten_url(request: URLRequest, db: Session = Depends(get_db)):
    short_code = secrets.token_urlsafe(6)
    db_url = URL(short_code=short_code, original_url=request.original_url)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    return {"short_url": f"http://localhost:8000/{short_code}"}

@app.get("/{short_code}")
def redirect_to_url(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(URL.short_code == short_code).first()
    if db_url is None:
        raise HTTPException(status_code=404, detail="URL not found")
    
    return RedirectResponse(url=db_url.original_url)

