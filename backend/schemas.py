from typing import List, Optional, Dict, Union
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict

class PerformanceMetrics(BaseModel):
    impact_score: int = Field(..., ge=0, le=100)
    technical_depth_score: int = Field(..., ge=0, le=100)
    soft_skills_score: int = Field(..., ge=0, le=100)
    growth_potential_score: int = Field(..., ge=0, le=100)
    stability_score: int = Field(..., ge=0, le=100)
    readability_score: int = Field(..., ge=0, le=100)
    keyword_score: int = Field(0, ge=0, le=100)

class RecruiterAnalysis(BaseModel):
    executive_summary: str
    technical_fit: str
    hiring_risks: List[str]
    verdict: str

class CandidateAnalysis(BaseModel):
    resume_tips: List[str]
    market_positioning: Union[str, List[str]]
    interview_prep: Union[str, List[str]]
    career_growth: Union[str, List[str]]
    job_suggestions: List[str] = []
    keywords_skills: List[str] = []
    job_targets: List[str] = []
    cover_letter: Optional[str] = None

class AIScore(BaseModel):
    total_score: int
    match_percentage: Optional[int] = None
    ats_compatibility_score: Optional[int] = None
    performance_metrics: PerformanceMetrics
    breakdown: Dict[str, int]
    pros: List[str]
    cons: List[str]
    skill_gaps: List[str] = []
    overall_feedback: str
    recruiter_analysis: RecruiterAnalysis
    candidate_analysis: CandidateAnalysis
    seniority_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    additional_notes: Optional[str] = None

class ExperienceItem(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    summary: Optional[str] = None

class EducationItem(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None

class ExtractedData(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    location: Optional[str] = None
    seniority_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: List[str] = []
    keywords: List[str] = []
    additional_notes: Optional[str] = None
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []

class CVResult(BaseModel):
    filename: str
    method: str
    duration: float
    text: str
    ai_data: Optional[ExtractedData] = None
    ai_score: Optional[AIScore] = None
    model_used: Optional[str] = None
    error: Optional[str] = None

class ExtractionResponse(BaseModel):
    results: List[CVResult]
    batch_summary: Optional[Dict] = None

class InterviewQuestion(BaseModel):
    category: str
    question: str
    expected_signal: str

class InterviewScript(BaseModel):
    intro: str
    questions: List[InterviewQuestion]
    closing: str

class InterviewRequest(BaseModel):
    cv_text: str
    dossier_summary: str
    jd_text: Optional[str] = None
    ai_key: Optional[str] = None

# --- User Management Schemas ---

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    full_name: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    phone_number: Optional[str] = None
    scans_remaining: int = 3
    
    # Onboarding Data
    referral_source: Optional[str] = None
    usage_intent: Optional[str] = None
    company_size: Optional[str] = None
    primary_skill: Optional[str] = None
    onboarding_completed: bool = False
    profile: Optional['UserProfileOut'] = None
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = "recruiter"
    
    # Onboarding Data
    referral_source: Optional[str] = None
    usage_intent: Optional[str] = None
    company_size: Optional[str] = None
    primary_skill: Optional[str] = None

class AdminUserAdd(BaseModel):
    email: EmailStr
    password: str
    role: str # admin, vip, recruiter, applier
    full_name: Optional[str] = None
    company: Optional[str] = None


class AdminUserUpdateRole(BaseModel):
    role: str  # admin, vip, recruiter, applier

class HistoryOut(BaseModel):
    id: int
    user_id: int
    filename: Optional[str] = None
    text: Optional[str] = None
    ai_data: Optional[Dict] = None
    ai_score: Optional[Dict] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    years_of_experience: Optional[int] = None
    seniority_level: Optional[str] = None
    keywords: Optional[str] = None
    score: Optional[int] = None
    additional_notes: Optional[str] = None
    ai_content_score: Optional[float] = None
    project_id: Optional[int] = None
    model_used: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Location & Device Schemas ---

class LocationUpdate(BaseModel):
    method: str # 'browser', 'ip', 'manual'
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    ip_address: Optional[str] = None

class UserLocationOut(BaseModel):
    id: int
    method: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    timestamp: datetime
    is_current: bool

    class Config:
        from_attributes = True

class UserDeviceOut(BaseModel):
    id: int
    device_type: Optional[str] = None
    os: Optional[str] = None
    browser: Optional[str] = None
    last_seen: datetime

    class Config:
        from_attributes = True

class UserProfileCreate(BaseModel):
    preferred_working_model: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    preferred_roles: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    career_goals: Optional[str] = None

class UserProfileOut(BaseModel):
    id: int
    preferred_working_model: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    preferred_roles: Optional[str] = None
    skills: Optional[str] = None
    career_goals: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    job_description: Optional[str] = None
    evaluation_criteria: Optional[Dict] = {}
    is_archived: int = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    job_description: Optional[str] = None
    evaluation_criteria: Optional[Dict] = None
    is_archived: Optional[int] = None

class ProjectOut(ProjectBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectSuggestion(BaseModel):
    project_id: int
    project_name: str
    match_score: int
    reasoning: str

class SuggestionResponse(BaseModel):
    suggestions: List[ProjectSuggestion]

# Re-update to resolve ForwardRef
UserOut.model_rebuild()
