from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
# Add current directory to path so it can find backend module
sys.path.append(os.getcwd())
from backend import models
from backend.models import User

# Database Configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./cvscore.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin").first()
    if admin:
        print(f"Admin found: {admin.email}, Role: {admin.role}")
    else:
        print("Admin not found.")
    db.close()

if __name__ == "__main__":
    check_admin()
