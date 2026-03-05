
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app, get_db
from backend.models import Base, User, CVHistory
from backend import utils_auth

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_cvscore.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_history_flow():
    # 1. Create a test user
    email = "test@example.com"
    password = "password123"
    hashed_password = utils_auth.get_password_hash(password)
    
    db = TestingSessionLocal()
    user = User(email=email, hashed_password=hashed_password, role="recruiter", scans_remaining=10)
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id = user.id
    db.close()

    # 2. Login to get token
    response = client.post("/auth/token", data={"username": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Add a history entry manually for this user
    db = TestingSessionLocal()
    history = CVHistory(
        user_id=user_id,
        filename="test_cv.pdf",
        text="Sample CV Text",
        score=75,
        seniority_level="Mid",
        full_name="John Doe",
        ai_score={"total_score": 75, "performance_metrics": {"impact_score": 80, "technical_depth_score": 70, "soft_skills_score": 60, "growth_potential_score": 85, "stability_score": 90, "readability_score": 80}}
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    history_id = history.id
    db.close()

    # 4. GET /history and verify
    response = client.get("/history", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["filename"] == "test_cv.pdf"
    assert data[0]["score"] == 75
    assert data[0]["user_id"] == user_id

    # 5. GET /history/{id} and verify
    response = client.get(f"/history/{history_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == history_id

    # 6. Test Filtering on page (Logic check)
    # Since filtering is done in frontend, we verify that the backend returns the necessary data for filtering
    assert "ai_score" in data[0]
    assert "performance_metrics" in data[0]["ai_score"]
    assert data[0]["ai_score"]["performance_metrics"]["impact_score"] == 80

    # 7. DELETE /history/{id}
    response = client.delete(f"/history/{history_id}", headers=headers)
    assert response.status_code == 200
    
    # 8. Verify it's gone
    response = client.get("/history", headers=headers)
    assert len(response.json()) == 0

def test_admin_history_access():
    # 1. Create a regular user and an admin user
    db = TestingSessionLocal()
    
    # Regular User
    reg_user = User(email="user@example.com", hashed_password=utils_auth.get_password_hash("pass"), role="recruiter")
    db.add(reg_user)
    
    # Admin User
    admin_user = User(email="admin@example.com", hashed_password=utils_auth.get_password_hash("adminpass"), role="admin")
    db.add(admin_user)
    
    db.commit()
    db.refresh(reg_user)
    db.refresh(admin_user)
    reg_user_id = reg_user.id
    db.close()

    # 2. Add history for regular user
    db = TestingSessionLocal()
    history = CVHistory(user_id=reg_user_id, filename="user_cv.pdf", score=80)
    db.add(history)
    db.commit()
    db.close()

    # 3. Login as Admin
    response = client.post("/auth/token", data={"username": "admin@example.com", "password": "adminpass"})
    admin_token = response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 4. Admin accesses Regular User's history
    response = client.get(f"/admin/users/{reg_user_id}/history", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["filename"] == "user_cv.pdf"

    # 5. Login as Regular User
    response = client.post("/auth/token", data={"username": "user@example.com", "password": "pass"})
    reg_token = response.json()["access_token"]
    reg_headers = {"Authorization": f"Bearer {reg_token}"}

    # 6. Regular User tries to access Admin history endpoint (should fail)
    response = client.get(f"/admin/users/{reg_user_id}/history", headers=reg_headers)
    assert response.status_code == 403 # check_role returns 403 for unauthorized roles

def test_history_unauthorized():
    response = client.get("/history")
    assert response.status_code == 401
