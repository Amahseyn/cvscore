import os
import time
import shutil
import logging
import uuid
from dotenv import load_dotenv
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Form, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

# Extraction engines
import fitz  # PyMuPDF
from pypdf import PdfReader
from pdfminer.high_level import extract_text as pdfminer_extract_text
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
import docx
import pandas as pd
import io
from fastapi.responses import StreamingResponse

# Internal modules
from .utils_ai import extract_structured_data, score_cv, generate_interview, rank_projects
from .schemas import (
    CVResult, ExtractionResponse, ExtractedData, AIScore, 
    InterviewScript, InterviewRequest, UserCreate, UserOut, 
    AdminUserAdd, AdminUserUpdateRole, HistoryOut,
    LocationUpdate, UserLocationOut, UserDeviceOut, UserProfileCreate,
    ProjectCreate, ProjectUpdate, ProjectOut,
    ProjectSuggestion, SuggestionResponse
)
from . import models, utils_auth
from .utils_location import get_location_from_ip, parse_user_agent
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, Session
import requests
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
# Consolidating imports above

# Configure logging with a more professional format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("cvscore.backend")

# Load environment variables from project root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)
logger.info(f"Neural Engine initialized. API Key presence: {bool(os.getenv('OPENROUTER_API_KEY'))}")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000")

app = FastAPI(
    title="CVScore Pro - Talent Intelligence API",
    version="2.0.0",
    description="Professional grade CV analysis and alignment engine."
)

# Standardized CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Request/Response Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    
    # Extract client info
    client_host = request.client.host if request.client else "unknown"
    method = request.method
    url = request.url.path
    
    logger.info(f"[{request_id}] START {method} {url} from {client_host}")
    
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = f"{process_time:.2f}ms"
        
        status_code = response.status_code
        log_level = logging.INFO
        if status_code >= 400:
            log_level = logging.WARNING
        if status_code >= 500:
            log_level = logging.ERROR
            
        logger.log(log_level, f"[{request_id}] END {method} {url} | Status: {status_code} | Duration: {formatted_process_time}")
        
        response.headers["X-Process-Time"] = formatted_process_time
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"[{request_id}] FAILED {method} {url} | Error: {str(e)} | Duration: {process_time:.2f}ms", exc_info=True)
        raise

# Database Configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./cvscore.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
models.Base.metadata.create_all(bind=engine)


# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth Dependency
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, utils_auth.SECRET_KEY, algorithms=[utils_auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

async def get_optional_current_user(db: Session = Depends(get_db), token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False))):
    if not token:
        return None
    try:
        payload = jwt.decode(token, utils_auth.SECRET_KEY, algorithms=[utils_auth.ALGORITHM])
        email: str = payload.get("sub")
        if email:
            return db.query(models.User).filter(models.User.email == email).first()
    except:
        return None
    return None

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

# Role Quotas
ROLE_QUOTAS = {
    "admin": 9999,
    "vip": 50,
    "recruiter": 5,
    "applier": 1,
    None: 1 # Guest
}

# Startup: Seed Admin
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        admin_email = "admin" # As requested by user
        admin_pass = "adminpass"
        existing = db.query(models.User).filter(models.User.email == admin_email).first()
        if not existing:
            hashed = utils_auth.get_password_hash(admin_pass)
            admin = models.User(
                email=admin_email, 
                hashed_password=hashed, 
                role="admin", 
                full_name="System Administrator"
            )
            db.add(admin)
            db.commit()
            logger.info("Default Admin 'admin'/'adminpass' initialized.")
    finally:
        db.close()

# RBAC Dependency
def check_role(required_roles: List[str]):
    async def role_checker(user: models.User = Depends(get_current_user)):
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation restricted. Required roles: {required_roles}"
            )
        return user
    return role_checker

class DocumentEngine:
    """Consolidated document extraction logic."""
    
    @staticmethod
    def extract_pymupdf(path: str) -> str:
        with fitz.open(path) as doc:
            return "".join(page.get_text() for page in doc)

    @staticmethod
    def extract_pypdf(path: str) -> str:
        reader = PdfReader(path)
        return "".join(page.extract_text() or "" for page in reader.pages)

    @staticmethod
    def extract_pdfminer(path: str) -> str:
        return pdfminer_extract_text(path)

    @staticmethod
    def extract_pdfplumber(path: str) -> str:
        with pdfplumber.open(path) as pdf:
            return "".join(page.extract_text() or "" for page in pdf.pages)

    @staticmethod
    def extract_ocr(path: str) -> str:
        images = convert_from_path(path)
        return "".join(pytesseract.image_to_string(img) for img in images)

    @staticmethod
    def extract_docx(path: str) -> str:
        doc = docx.Document(path)
        return "\n".join([para.text for para in doc.paragraphs])

    @staticmethod
    def extract_txt(path: str) -> str:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

# --- AUTH ENDPOINTS ---

@app.post("/auth/register")
async def register(req: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Identity already forged in the neural net.")
    
    hashed_password = utils_auth.get_password_hash(req.password)
    new_user = models.User(
        email=req.email,
        hashed_password=hashed_password,
        role=req.role or "recruiter",
        full_name=req.full_name,
        company=req.company,
        industry=req.industry,
        phone_number=req.phone_number,
        referral_source=req.referral_source,
        usage_intent=req.usage_intent,
        company_size=req.company_size,
        primary_skill=req.primary_skill
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Identity synthesized successfully", "email": new_user.email}

@app.get("/admin/users", response_model=List[UserOut])
async def get_all_users(
    admin: models.User = Depends(check_role(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(models.User).all()

@app.post("/admin/users/add")
async def admin_add_user(
    req: AdminUserAdd,
    admin: models.User = Depends(check_role(["admin"])),
    db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed = utils_auth.get_password_hash(req.password)
    user = models.User(
        email=req.email,
        hashed_password=hashed,
        role=req.role,
        full_name=req.full_name,
        company=req.company
    )
    db.add(user)
    db.commit()
    return {"message": f"User {req.email} added with role {req.role}"}


@app.patch("/admin/users/{user_id}/role", response_model=UserOut)
async def admin_update_user_role(
    user_id: int,
    payload: AdminUserUpdateRole,
    admin: models.User = Depends(check_role(["admin"])),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent demoting the last remaining admin
    if user.role == "admin" and payload.role != "admin":
        admin_count = db.query(models.User).filter(models.User.role == "admin").count()
        if admin_count <= 1 and user.id == admin.id:
            raise HTTPException(status_code=400, detail="Cannot demote the last active admin")

    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


@app.delete("/admin/users/{user_id}")
async def admin_delete_user(
    user_id: int,
    admin: models.User = Depends(check_role(["admin"])),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Admins cannot delete their own account")

    db.delete(user)
    db.commit()
    return {"message": f"User {user.email} deleted"}

@app.get("/admin/stats")
async def get_admin_stats(
    admin: models.User = Depends(check_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Aggregate stats for the admin dashboard overview.
    """
    total_users = db.query(models.User).count()
    total_scans = db.query(models.CVHistory).count()
    
    # Usage Intent Distribution
    intent_counts = db.query(models.User.usage_intent, func.count(models.User.id))\
        .group_by(models.User.usage_intent).all()
    
    # Referral Source Distribution
    source_counts = db.query(models.User.referral_source, func.count(models.User.id))\
        .group_by(models.User.referral_source).all()
        
    # Geographic distribution (based on last known location)
    geo_counts = db.query(models.UserLocation.country, func.count(models.UserLocation.id))\
        .filter(models.UserLocation.is_current == 1)\
        .group_by(models.UserLocation.country).all()

    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "intents": [{"label": i[0] or "Unknown", "value": i[1]} for i in intent_counts],
        "sources": [{"label": s[0] or "Unknown", "value": s[1]} for s in source_counts],
        "geo": [{"country": g[0] or "Unknown", "count": g[1]} for g in geo_counts],
        "advanced": {
            "work_models": db.query(models.UserProfile.preferred_working_model, func.count(models.UserProfile.id))\
                .group_by(models.UserProfile.preferred_working_model).all(),
            "avg_salary_min": db.query(func.avg(models.UserProfile.salary_min)).scalar() or 0
        }
    }
@app.get("/admin/users/{user_id}/history")
async def get_user_history_admin(
    user_id: int,
    admin: models.User = Depends(check_role(["admin"])),
    db: Session = Depends(get_db)
):
    history = db.query(models.CVHistory).filter(models.CVHistory.user_id == user_id).all()
    return history

@app.post("/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not utils_auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = utils_auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role, 
        "full_name": user.full_name,
        "scans_remaining": user.scans_remaining
    }

# --- PROJECT ENDPOINTS ---

@app.post("/projects", response_model=ProjectOut)
async def create_project(
    req: ProjectCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = models.Project(
        user_id=current_user.id,
        **req.dict()
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@app.get("/projects", response_model=List[ProjectOut])
async def list_projects(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Project).filter(
        models.Project.user_id == current_user.id,
        models.Project.is_archived == 0
    ).all()

@app.get("/projects/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.patch("/projects/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: int,
    req: ProjectUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = req.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return project

    db.delete(project)
    db.commit()
    return {"message": "Project successfully dissolved"}

@app.get("/projects/suggest/{history_id}", response_model=SuggestionResponse)
async def suggest_positions(
    history_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Suggest relevant positions for a specific CV from the candidate's history.
    """
    history_item = db.query(models.CVHistory).filter(
        models.CVHistory.id == history_id,
        models.CVHistory.user_id == current_user.id
    ).first()
    
    if not history_item:
        raise HTTPException(status_code=404, detail="CV not found in your neural history.")
        
    projects = db.query(models.Project).filter(
        models.Project.user_id == current_user.id,
        models.Project.is_archived == 0
    ).all()
    
    if not projects:
        return {"suggestions": []}
        
    # Prepare data for AI
    candidate_summary = f"Full Name: {history_item.full_name}\nSeniority: {history_item.seniority_level}\nSkills: {history_item.keywords}\nExperience: {history_item.years_of_experience} years"
    projects_list = [{"id": p.id, "name": p.name, "jd": p.job_description or ""} for p in projects]
    
    ai_res = rank_projects(candidate_summary, projects_list)
    return SuggestionResponse(suggestions=ai_res["data"]["suggestions"])

# --- LOCATION & DEVICE ENDPOINTS ---

@app.post("/users/me/location", response_model=UserLocationOut)
async def update_location(
    req: LocationUpdate,
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user's location using one of the three methods: 'browser', 'ip', or 'manual'.
    Also collects IP address and device data.
    """
    # 1. Handle IP-based automatic lookup if needed
    location_data = req.dict(exclude_unset=True)
    client_ip = request.client.host if request.client else None
    
    if req.method == "ip" and client_ip:
        enriched_data = get_location_from_ip(client_ip)
        if enriched_data:
            location_data.update(enriched_data)
    
    # Set all previous locations for this user to not current
    db.query(models.UserLocation).filter(
        models.UserLocation.user_id == current_user.id
    ).update({"is_current": 0})
    
    # 2. Create new location record
    new_location = models.UserLocation(
        user_id=current_user.id,
        method=req.method,
        latitude=location_data.get("latitude"),
        longitude=location_data.get("longitude"),
        accuracy=location_data.get("accuracy"),
        city=location_data.get("city"),
        region=location_data.get("region"),
        country=location_data.get("country"),
        country_code=location_data.get("country_code"),
        ip_address=client_ip,
        is_current=1
    )
    
    # 3. Handle device tracking
    ua_string = request.headers.get("user-agent", "")
    device_info = parse_user_agent(ua_string)
    
    existing_device = db.query(models.UserDevice).filter(
        models.UserDevice.user_id == current_user.id,
        models.UserDevice.user_agent == ua_string
    ).first()
    
    if existing_device:
        existing_device.last_seen = models.datetime.utcnow()
    else:
        new_device = models.UserDevice(
            user_id=current_user.id,
            **device_info
        )
        db.add(new_device)
        
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location

@app.get("/users/me/location/history", response_model=List[UserLocationOut])
async def get_location_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.UserLocation).filter(
        models.UserLocation.user_id == current_user.id
    ).order_by(models.UserLocation.timestamp.desc()).all()

@app.get("/users/me/devices", response_model=List[UserDeviceOut])
async def get_user_devices(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.UserDevice).filter(
        models.UserDevice.user_id == current_user.id
    ).order_by(models.UserDevice.last_seen.desc()).all()


@app.post("/users/me/profile", response_model=UserOut)
async def update_user_profile(
    profile_req: UserProfileCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update candidate's detailed profile and reward with +2 scans if first time.
    """
    # 1. Update or create Profile
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    
    profile_data = profile_req.dict(exclude_unset=True)
    # Convert lists to comma-separated strings for SQLite (or use JSON if PostgreSQL)
    if "preferred_roles" in profile_data and profile_data["preferred_roles"]:
        profile_data["preferred_roles"] = ",".join(profile_data["preferred_roles"])
    if "skills" in profile_data and profile_data["skills"]:
        profile_data["skills"] = ",".join(profile_data["skills"])

    if profile:
        for key, value in profile_data.items():
            setattr(profile, key, value)
    else:
        profile = models.UserProfile(user_id=current_user.id, **profile_data)
        db.add(profile)
    
    # 2. Reward Logic
    reward_granted = False
    if current_user.onboarding_completed == 0:
        current_user.scans_remaining += 2
        current_user.onboarding_completed = 1
        reward_granted = True
        logger.info(f"User {current_user.email} rewarded with 2 scans for completing onboarding.")

    db.commit()
    db.refresh(current_user)
    
    return current_user


@app.get("/auth/google")
async def google_auth():
    """
    Redirect the user to Google's OAuth2 authorization page.
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        logger.error("Google OAuth credentials missing from environment")
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on the server")
    
    scope = "openid email profile"
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    logger.info(f"Initiating Google OAuth flow. Redirecting to: {auth_url}")
    return RedirectResponse(auth_url)


@app.post("/auth/google/callback")
async def google_auth_callback(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Exchange a Google OAuth authorization code for profile information,
    map it to a local user, and return a first-party access token.
    """
    code = payload.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on the server")

    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": payload.get("redirect_uri", GOOGLE_REDIRECT_URI),
        "grant_type": "authorization_code",
    }

    try:
        token_resp = requests.post(
            "https://oauth2.googleapis.com/token",
            data=token_data,
            timeout=10,
        )
        token_resp.raise_for_status()
        token_json = token_resp.json()
    except Exception as e:
        logger.error(f"Google token exchange failed: {e}")
        raise HTTPException(status_code=502, detail="Failed to exchange Google authorization code")

    if "error" in token_json:
        logger.error(f"Google token error: {token_json}")
        raise HTTPException(
            status_code=400,
            detail=token_json.get("error_description") or token_json.get("error") or "Google token error",
        )

    access_token_google = token_json.get("access_token")
    if not access_token_google:
        raise HTTPException(status_code=400, detail="Missing Google access token in response")

    # Fetch basic profile info
    try:
        userinfo_resp = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token_google}"},
            timeout=10,
        )
        userinfo_resp.raise_for_status()
        profile = userinfo_resp.json()
    except Exception as e:
        logger.error(f"Google userinfo fetch failed: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch Google user profile")

    email = profile.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google profile did not contain an email address")

    full_name = profile.get("name") or email.split("@")[0]

    # Get or create local user
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Google-authenticated users still get a local record; password is random/unusable
        random_password = utils_auth.get_password_hash(uuid.uuid4().hex)
        user = models.User(
            email=email,
            hashed_password=random_password,
            role="recruiter",
            full_name=full_name,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token_local = utils_auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token_local,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
        "full_name": user.full_name,
        "scans_remaining": user.scans_remaining
    }

@app.get("/auth/me")
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {"email": current_user.email, "role": current_user.role, "full_name": current_user.full_name}

@app.post("/extract", response_model=ExtractionResponse)
async def process_cvs(
    files: List[UploadFile] = File(...),
    method: str = Form("pymupdf"),
    use_ocr: bool = Form(True),
    ai_key: Optional[str] = Form(None),
    do_ai_score: bool = Form(False),
    do_ai_extract: bool = Form(False),
    jd_text: Optional[str] = Form(None),
    project_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Standardized CV processing endpoint with support for batch operations
    and granular AI analysis.
    """
    # QUOTA ENFORCEMENT
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Registration required to access the Neural Engine. Guests are restricted from neural uploads."
        )

    if current_user.role != "admin" and current_user.scans_remaining < len(files):
        logger.warning(f"Quota Exceeded: {current_user.email} attempted {len(files)} files (Remaining: {current_user.scans_remaining})")
        raise HTTPException(
            status_code=403, 
            detail=f"Neural Bandwidth Exceeded. You have {current_user.scans_remaining} scans remaining in your free trial."
        )

    results: List[CVResult] = []
    logger.info(f"Starting batch process for {len(files)} files. Method: {method}, AI Score: {do_ai_score}, AI Extract: {do_ai_extract}")
    
    for i, file in enumerate(files):
        logger.info(f"[{i+1}/{len(files)}] Processing: {file.filename}")
        await file.seek(0) # Ensure we're at the beginning of the file stream
        ext = file.filename.lower()
        if not (ext.endswith(".pdf") or ext.endswith(".docx") or ext.endswith(".txt")):
            results.append(CVResult(
                filename=file.filename,
                method="n/a",
                duration=0,
                text="",
                error="Unsupported file type. Only PDF, DOCX, and TXT are allowed."
            ))
            continue

        local_path = os.path.join(TEMP_DIR, f"{uuid.uuid4()}_{file.filename}")
        logger.debug(f"Saving temporary file to: {local_path}")
        
        try:
            with open(local_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            start = time.time()
            text = ""
            current_method = method
            model_used = None

            # Core Extraction
            if file.filename.lower().endswith(".docx"):
                logger.debug(f"[{i+1}/{len(files)}] Using python-docx for {file.filename}")
                text = DocumentEngine.extract_docx(local_path)
                current_method = "python-docx"
            elif file.filename.lower().endswith(".txt"):
                logger.debug(f"[{i+1}/{len(files)}] Using direct read for {file.filename}")
                text = DocumentEngine.extract_txt(local_path)
                current_method = "text-read"
            elif method == "pymupdf":
                logger.debug(f"[{i+1}/{len(files)}] Using PyMuPDF for {file.filename}")
                text = DocumentEngine.extract_pymupdf(local_path)
            elif method == "pypdf":
                logger.debug(f"[{i+1}/{len(files)}] Using pypdf for {file.filename}")
                text = DocumentEngine.extract_pypdf(local_path)
            elif method == "pdfminer":
                logger.debug(f"[{i+1}/{len(files)}] Using pdfminer for {file.filename}")
                text = DocumentEngine.extract_pdfminer(local_path)
            elif method == "pdfplumber":
                logger.debug(f"[{i+1}/{len(files)}] Using pdfplumber for {file.filename}")
                text = DocumentEngine.extract_pdfplumber(local_path)

            # OCR Fallback (PDF only)
            if not text.strip() and use_ocr and file.filename.lower().endswith(".pdf"):
                logger.info(f"[{i+1}/{len(files)}] {file.filename} appears empty/scanned. Triggering OCR Fallback...")
                text = DocumentEngine.extract_ocr(local_path)
                current_method = f"{method} (OCR Fallback)"
                logger.info(f"[{i+1}/{len(files)}] OCR Extraction completed for {file.filename}")

            # AI Pipeline
            ai_data = None
            ai_score = None
            
            # Use specific JD from project if project_id is provided and no jd_text is passed
            current_jd_text = jd_text
            if project_id and not current_jd_text:
                proj = db.query(models.Project).filter(models.Project.id == project_id).first()
                if proj:
                    current_jd_text = proj.job_description

            if text.strip():
                if do_ai_extract:
                    try:
                        ai_res = extract_structured_data(text, api_key=ai_key)
                        ai_data_raw = ai_res["data"]
                        model_used = ai_res["model"]
                        ai_data = ExtractedData(**ai_data_raw)
                    except Exception as e:
                        logger.error(
                            f"[{i+1}/{len(files)}] AI extraction failed for {file.filename}: {str(e)}",
                            exc_info=True,
                        )
                if do_ai_score:
                    try:
                        ai_res = score_cv(text, job_description=current_jd_text, api_key=ai_key)
                        ai_score_raw = ai_res["data"]
                        model_used = ai_res["model"]
                        ai_score = AIScore(**ai_score_raw)
                        
                        # Calculate backend aggregate score (equal weighting for logging)
                        metrics = ai_score.performance_metrics
                        avg_score = sum([
                            metrics.impact_score,
                            metrics.technical_depth_score,
                            metrics.soft_skills_score,
                            metrics.growth_potential_score,
                            metrics.stability_score,
                            metrics.readability_score
                        ]) / 6
                        logger.info(f"[{i+1}/{len(files)}] Scored {file.filename}: {avg_score:.1f}% Aggregate (Raw)")
                    except Exception as e:
                        logger.error(
                            f"[{i+1}/{len(files)}] AI scoring failed for {file.filename}: {str(e)}",
                            exc_info=True,
                        )

            cv_res = CVResult(
                filename=file.filename,
                method=current_method,
                duration=time.time() - start,
                text=text,
                ai_data=ai_data,
                ai_score=ai_score,
                model_used=model_used if (do_ai_extract or do_ai_score) else None
            )
            results.append(cv_res)
            logger.info(f"[{i+1}/{len(files)}] Successfully processed {file.filename} in {time.time() - start:.2f}s")

            # PERSISTENCE: Save to history if user is logged in
            if current_user:
                # Extract metadata for database
                db_score = ai_score.total_score if ai_score else None
                db_seniority = ai_score.seniority_level if ai_score else (ai_data.seniority_level if ai_data else None)
                db_yoe = ai_score.years_of_experience if ai_score else (ai_data.years_of_experience if ai_data else None)
                db_keywords = ",".join(ai_data.keywords) if ai_data and ai_data.keywords else ""
                db_notes = ai_score.additional_notes if ai_score else (ai_data.additional_notes if ai_data else None)

                history_entry = models.CVHistory(
                    user_id=current_user.id,
                    project_id=project_id,
                    filename=file.filename,
                    text=text,
                    ai_data=ai_data.dict() if ai_data else None,
                    ai_score=ai_score.dict() if ai_score else None,
                    full_name=ai_data.full_name if ai_data else None,
                    email=ai_data.email if ai_data else None,
                    phone=ai_data.phone if ai_data else None,
                    linkedin=ai_data.linkedin if ai_data else None,
                    years_of_experience=db_yoe,
                    seniority_level=db_seniority,
                    keywords=db_keywords,
                    score=db_score,
                    additional_notes=db_notes,
                    model_used=model_used if (do_ai_extract or do_ai_score) else None
                )
                db.add(history_entry)
                if current_user.role != "admin":
                    current_user.scans_remaining = max(0, current_user.scans_remaining - 1)
                
                db.add(current_user)
                db.commit()
                logger.debug(f"[{i+1}/{len(files)}] Persisted results and updated scan balance for {file.filename}")

        except Exception as e:
            logger.error(f"[{i+1}/{len(files)}] Critical failure processing {file.filename}: {str(e)}", exc_info=True)
            results.append(CVResult(
                filename=file.filename,
                method=method,
                duration=0,
                text="",
                error=f"Processing failed: {str(e)}"
            ))
        finally:
            if 'local_path' in locals() and os.path.exists(local_path):
                try:
                    os.remove(local_path)
                    logger.debug(f"Cleaned up {local_path}")
                except Exception as cleanup_err:
                    logger.warning(f"Failed to cleanup {local_path}: {cleanup_err}")

    summary = {
        "total": len(files),
        "success": sum(1 for r in results if not r.error),
        "failed": sum(1 for r in results if r.error),
        "avg_duration": sum(r.duration for r in results) / len(results) if results else 0
    }
    logger.info(f"Batch completed: {summary['success']} successes, {summary['failed']} failures.")
    return ExtractionResponse(results=results, batch_summary=summary)

@app.post("/interview", response_model=InterviewScript)
async def get_interview_script(req: InterviewRequest):
    """
    Generate a tailored interview script based on a specific candidate dossier.
    """
    try:
        res = generate_interview(
            cv_text=req.cv_text,
            dossier_summary=req.dossier_summary,
            job_description=req.jd_text,
            api_key=req.ai_key
        )
        script = res["data"]
        return InterviewScript(**script)
    except Exception as e:
        logger.error(f"Interview generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate interview script: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/export/excel")
async def export_excel(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export candidate evaluation data to a professional Excel (.xlsx) file.
    """
    history = db.query(models.CVHistory).filter(models.CVHistory.user_id == current_user.id).all()
    
    if not history:
        raise HTTPException(status_code=404, detail="No evaluation data found to export")
        
    data = []
    for item in history:
        data.append({
            "Full Name": item.full_name or "N/A",
            "Email": item.email or "N/A",
            "Phone Number": item.phone or "N/A",
            "LinkedIn": item.linkedin or "N/A",
            "Seniority Level": item.seniority_level or "N/A",
            "Years of Experience": item.years_of_experience if item.years_of_experience is not None else "N/A",
            "Extracted Keywords": item.keywords or "N/A",
            "Evaluation Score": f"{item.score}%" if item.score is not None else "N/A",
            "Additional Notes": item.additional_notes or "N/A",
            "Filename": item.filename,
            "Date Evaluated": item.timestamp.strftime("%Y-%m-%d %H:%M")
        })
        
    df = pd.DataFrame(data)
    
    # Create the Excel file in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Candidate Evaluations")
        
        # Auto-adjust column widths for a professional look
        worksheet = writer.sheets["Candidate Evaluations"]
        for idx, col in enumerate(df.columns):
            max_len = max(df[col].astype(str).map(len).max(), len(col)) + 2
            worksheet.column_dimensions[chr(65 + idx)].width = min(max_len, 50) # Cap at 50
    
    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="cvscore_evaluations.xlsx"'
    }
    
    return StreamingResponse(
        output,
        headers=headers,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

# --- HISTORY ENDPOINTS ---

@app.get("/history", response_model=List[HistoryOut])
async def get_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    history = db.query(models.CVHistory).filter(models.CVHistory.user_id == current_user.id).order_by(models.CVHistory.timestamp.desc()).all()
    return history

@app.get("/history/{history_id}", response_model=HistoryOut)
async def get_history_item(
    history_id: int, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    item = db.query(models.CVHistory).filter(
        models.CVHistory.id == history_id,
        models.CVHistory.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Archive not found in your vault")
    return item

@app.delete("/history/{history_id}")
async def delete_history_item(
    history_id: int, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    item = db.query(models.CVHistory).filter(
        models.CVHistory.id == history_id,
        models.CVHistory.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Archive not found in your vault")
    
    db.delete(item)
    db.commit()
    return {"message": "Archive successfully purged from the neural net"}

@app.get("/admin/users/{user_id}/history", response_model=List[HistoryOut])
async def get_user_history_admin(
    user_id: int,
    admin: models.User = Depends(check_role(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(models.CVHistory).filter(models.CVHistory.user_id == user_id).all()
