#!/usr/bin/env python3
"""
Run the FastAPI application using Uvicorn.
"""
import uvicorn
from pathlib import Path
import sys

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent))

if __name__ == "__main__":
    # Run the FastAPI application using Uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,  # Changed from 8000 to 8001
        reload=True,
        log_level="info"
    )
