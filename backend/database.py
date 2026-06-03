import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DEFAULT_DATA_DIR = Path(os.getenv("LAB_DATA_DIR", "./data"))
DEFAULT_DATA_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("LAB_DATABASE_URL", f"sqlite:///{DEFAULT_DATA_DIR / 'lab_ledger.db'}")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
