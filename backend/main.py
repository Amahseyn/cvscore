import os
import time
import shutil
import logging
import uuid
from dotenv import load_dotenv
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Form, Body
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
from .utils_ai import extract_structured_data, score_cv, generate_interview
from .schemas import CVResult, ExtractionResponse, ExtractedData, AIScore, InterviewScript, InterviewRequest
from . import models, utils_auth
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import requests
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from .schemas import UserCreate, UserOut, AdminUserAdd, AdminUserUpdateRole

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
async def log_requests(request: requests.Request, call_next):
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
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "full_name": user.full_name}


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
        "redirect_uri": GOOGLE_REDIRECT_URI,
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
        logger.warning(f"Quota Exceeded: {current_user.email if current_user else 'Guest'} attempted {len(files)} files (Limit: {quota})")
        raise HTTPException(
            status_code=403, 
            detail=f"Neural Bandwidth Exceeded. '{user_role}' role is capped at {quota} files per batch. Upgrade to VIP or Admin for higher throughput."
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
            if text.strip():
                if do_ai_extract:
                    try:
                        ai_data_raw = extract_structured_data(text, api_key=ai_key)
                        ai_data = ExtractedData(**ai_data_raw)
                    except Exception as e:
                        logger.error(
                            f"[{i+1}/{len(files)}] AI extraction failed for {file.filename}: {str(e)}",
                            exc_info=True,
                        )
                if do_ai_score:
                    try:
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
                ai_score=ai_score
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
                    additional_notes=db_notes
                )
                db.add(history_entry)
                db.commit()
                logger.debug(f"[{i+1}/{len(files)}] Persisted results for {file.filename} to user history")

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
