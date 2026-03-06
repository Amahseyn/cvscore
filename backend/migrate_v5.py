import sqlite3
import os

def migrate_v5(db_path):
    if not os.path.exists(db_path):
        print(f"Skipping {db_path} (not found).")
        return

    print(f"Migrating {db_path} to v5...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Add evaluation_criteria to projects
    try:
        print("Adding column evaluation_criteria to projects...")
        cursor.execute("ALTER TABLE projects ADD COLUMN evaluation_criteria JSON DEFAULT '{}'")
        conn.commit()
    except sqlite3.OperationalError:
        print("Column evaluation_criteria already exists.")

    # 2. Add is_archived to projects
    try:
        print("Adding column is_archived to projects...")
        cursor.execute("ALTER TABLE projects ADD COLUMN is_archived INTEGER DEFAULT 0")
        conn.commit()
    except sqlite3.OperationalError:
        print("Column is_archived already exists.")

    conn.close()

if __name__ == "__main__":
    db_file = "backend/cvscore.db" if os.path.exists("backend/cvscore.db") else "cvscore.db"
    migrate_v5(db_file)
    print("Migration v5 complete.")
