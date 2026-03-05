import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the current directory to path so we can import models
sys.path.append("/home/a/Code/cvscore/backend")
import models

DATABASE_URL = "sqlite:///./cvscore.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_history():
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        print(f"Total Users: {len(users)}")
        for u in users:
            history_count = db.query(models.CVHistory).filter(models.CVHistory.user_id == u.id).count()
            print(f"User: {u.email} (ID: {u.id}) | History Count: {history_count}")
            
        all_history = db.query(models.CVHistory).all()
        print(f"Total History Entries: {len(all_history)}")
        if all_history:
            print("\nLatest 3 Entries:")
            for h in all_history[-3:]:
                print(f"- ID: {h.id}, UserID: {h.user_id}, Name: {h.full_name}, Filename: {h.filename}, Score: {h.score}, Timestamp: {h.timestamp}")
    finally:
        db.close()

if __name__ == "__main__":
    check_history()
