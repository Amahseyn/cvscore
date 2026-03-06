import sqlite3
import os

def migrate_db(db_path):
    if not os.path.exists(db_path):
        print(f"Skipping {db_path} (not found).")
        return

    print(f"Migrating {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Add onboarding_completed to users
    try:
        print("Adding column onboarding_completed to users...")
        cursor.execute("ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0")
        conn.commit()
        print("Column onboarding_completed added successfully.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column onboarding_completed already exists.")
        else:
            print(f"Error adding column onboarding_completed: {e}")

    # 2. Create user_profiles table
    try:
        print("Creating table user_profiles...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE,
                preferred_working_model TEXT,
                salary_min INTEGER,
                salary_max INTEGER,
                preferred_roles TEXT,
                skills TEXT,
                career_goals TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        conn.commit()
        print("Table user_profiles created successfully.")
    except Exception as e:
        print(f"Error creating user_profiles table: {e}")

    conn.close()

def migrate():
    # Migrate both potential paths to be safe
    migrate_db("cvscore.db")
    migrate_db("backend/cvscore.db")
    print("Migration v3 complete.")

if __name__ == "__main__":
    migrate()
