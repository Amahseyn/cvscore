import os
import time
import shutil
import logging
import uuid
from dotenv import load_dotenv
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware

# Extraction engines
import fitz  # PyMuPDF
from pypdf import PdfReader
from pdfminer.high_level import extract_text as pdfminer_extract_text
import pdfplumber
import pytesseract
from pdf2image import convert_from_path

# Internal modules
from .utils_ai import extract_structured_data, score_cv, generate_interview
from .schemas import CVResult, ExtractionResponse, ExtractedData, AIScore, InterviewScript, InterviewRequest
from . import models, utils_auth
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from .schemas import UserCreate, UserOut, AdminUserAdd

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from project root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)
logger.info(f"Neural Engine initialized. API Key presence: {bool(os.getenv('OPENROUTER_API_KEY'))}")

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

class PDFEngine:
    """Consolidated PDF extraction logic."""
    
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
        phone_number=req.phone_number
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
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.get("/auth/me")
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {"email": current_user.email, "role": current_user.role}

@app.post("/extract", response_model=ExtractionResponse)
async def process_cvs(
    files: List[UploadFile] = File(...),
    method: str = Form("pymupdf"),
    use_ocr: bool = Form(True),
    ai_key: Optional[str] = Form(None),
    do_ai_score: bool = Form(False),
    do_ai_extract: bool = Form(False),
    jd_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Standardized CV processing endpoint with support for batch operations
    and granular AI analysis.
    """
    # QUOTA ENFORCEMENT
    user_role = current_user.role if current_user else None
    quota = ROLE_QUOTAS.get(user_role, 1)
    
    if len(files) > quota:
        raise HTTPException(
            status_code=403, 
            detail=f"Neural Bandwidth Exceeded. '{user_role}' role is capped at {quota} files per batch. Upgrade to VIP or Admin for higher throughput."
        )

    results: List[CVResult] = []
    logger.info(f"Starting batch process for {len(files)} files. Method: {method}, AI Score: {do_ai_score}, AI Extract: {do_ai_extract}")
    
    for i, file in enumerate(files):
        logger.info(f"[{i+1}/{len(files)}] Processing: {file.filename}")
        if not file.filename.lower().endswith(".pdf"):
            results.append(CVResult(
                filename=file.filename,
                method="n/a",
                duration=0,
                text="",
                error="Unsupported file type. Only PDF is allowed."
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

            # Core Extraction
            if method == "pymupdf":
                text = PDFEngine.extract_pymupdf(local_path)
            elif method == "pypdf":
                text = PDFEngine.extract_pypdf(local_path)
            elif method == "pdfminer":
                text = PDFEngine.extract_pdfminer(local_path)
            elif method == "pdfplumber":
                text = PDFEngine.extract_pdfplumber(local_path)

            # OCR Fallback
            if not text.strip() and use_ocr:
                text = PDFEngine.extract_ocr(local_path)
                current_method = f"{method} (OCR Fallback)"

            # AI Pipeline
            ai_data = None
            ai_score = None
            if text.strip():
                if do_ai_extract:
                    ai_data_raw = extract_structured_data(text, api_key=ai_key)
                    ai_data = ExtractedData(**ai_data_raw)
                if do_ai_score:
                    ai_score_raw = score_cv(text, job_description=jd_text, api_key=ai_key)
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

            cv_res = CVResult(
                filename=file.filename,
                method=current_method,
                duration=time.time() - start,
                text=text,
                ai_data=ai_data,
                ai_score=ai_score
            )
            results.append(cv_res)
            logger.info(f"[{i+1}/{len(files)}] Successfully processed {file.filename} in {time.time() - start:.2f}s")

            # PERSISTENCE: Save to history if user is logged in
            if current_user:
                history_entry = models.CVHistory(
                    user_id=current_user.id,
                    filename=file.filename,
                    text=text,
                    ai_data=ai_data.dict() if ai_data else None,
                    ai_score=ai_score.dict() if ai_score else None
                )
                db.add(history_entry)
                db.commit()

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
        script = generate_interview(
            cv_text=req.cv_text,
            dossier_summary=req.dossier_summary,
            job_description=req.jd_text,
            api_key=req.ai_key
        )
        return InterviewScript(**script)
    except Exception as e:
        logger.error(f"Interview generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate interview script: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}

# --- HISTORY ENDPOINTS ---

@app.get("/history")
async def get_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    history = db.query(models.CVHistory).filter(models.CVHistory.user_id == current_user.id).all()
    return history

@app.get("/history/{item_id}")
async def get_history_item(item_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(models.CVHistory).filter(models.CVHistory.id == item_id, models.CVHistory.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="History item not found")
    return item

@app.delete("/history/{item_id}")
async def delete_history_item(item_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(models.CVHistory).filter(models.CVHistory.id == item_id, models.CVHistory.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="History item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}
