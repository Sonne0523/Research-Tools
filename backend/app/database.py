import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for simple local deployment, PostgreSQL for production
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./research.db")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Fix for SQLAlchemy not supporting 'postgres://'
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Ensure sslmode=require is present for Supabase/Production
    if "sslmode=" not in SQLALCHEMY_DATABASE_URL:
        separator = "&" if "?" in SQLALCHEMY_DATABASE_URL else "?"
        SQLALCHEMY_DATABASE_URL += f"{separator}sslmode=require"
    
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=20,          # Increase base pool size
        max_overflow=30,       # Allow more overflow during high load
        pool_timeout=60,       # Wait longer for a connection if busy
        pool_recycle=1800,     # Recycle connections every 30 mins
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
