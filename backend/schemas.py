from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Union

class PerformanceMetrics(BaseModel):
    impact_score: int = Field(..., ge=0, le=100)
    technical_depth_score: int = Field(..., ge=0, le=100)
    soft_skills_score: int = Field(..., ge=0, le=100)
    growth_potential_score: int = Field(..., ge=0, le=100)
    stability_score: int = Field(..., ge=0, le=100)
    readability_score: int = Field(..., ge=0, le=100)

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

class AIScore(BaseModel):
    total_score: int
    match_percentage: Optional[int] = None
    performance_metrics: PerformanceMetrics
    breakdown: Dict[str, int]
    pros: List[str]
    cons: List[str]
    skill_gaps: List[str] = []
    overall_feedback: str
    recruiter_analysis: RecruiterAnalysis
    candidate_analysis: CandidateAnalysis

class ExtractedData(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    experience: List[Dict[str, str]] = []
    education: List[Dict[str, str]] = []

class CVResult(BaseModel):
    filename: str
    method: str
    duration: float
    text: str
    ai_data: Optional[ExtractedData] = None
    ai_score: Optional[AIScore] = None
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

class AdminUserAdd(BaseModel):
    email: EmailStr
    password: str
    role: str # admin, vip, recruiter, applier
    full_name: Optional[str] = None
    company: Optional[str] = None
