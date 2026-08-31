from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

Base = declarative_base()

def _get_db_url() -> str:
    """Get and sanitize the database URL from settings."""
    # Read directly from env var first, bypass pydantic settings
    url = os.environ.get("SQLALCHEMY_DATABASE_URI", "")
    
    # DEBUG: print raw value
    print(f"[DEBUG] Raw SQLALCHEMY_DATABASE_URI from env: {repr(url[:50]) if url else repr(url)}")
    
    # Strip whitespace and accidental surrounding quotes
    url = url.strip().strip('"').strip("'").strip()
    
    if not url:
        print("[DEBUG] URL is empty, falling back to SQLite")
        return "sqlite:///./placement_portal.db"
    
    # Handle Render's postgres:// scheme
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    print(f"[DEBUG] Sanitized URL starts with: {url[:40]}")
    return url

def _create_engine():
    url = _get_db_url()
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    try:
        return create_engine(url, pool_pre_ping=True, connect_args=connect_args)
    except Exception as e:
        print(f"[ERROR] Failed to create engine with URL {repr(url[:50])}: {e}")
        print("[DEBUG] Falling back to SQLite...")
        return create_engine("sqlite:///./placement_portal.db", connect_args={"check_same_thread": False})

engine = _create_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

