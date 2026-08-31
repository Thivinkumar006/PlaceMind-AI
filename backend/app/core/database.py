from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

def _get_db_url() -> str:
    """Get and sanitize the database URL from settings."""
    from app.core.config import settings
    url = settings.SQLALCHEMY_DATABASE_URI or ""
    # Strip whitespace and accidental surrounding quotes
    url = url.strip().strip('"').strip("'")
    # Handle Render's postgres:// scheme
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url or "sqlite:///./placement_portal.db"

def _create_engine():
    url = _get_db_url()
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, pool_pre_ping=True, connect_args=connect_args)

engine = _create_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
