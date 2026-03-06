from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="recruiter") # admin, vip, recruiter, applier
    full_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    scans_remaining = Column(Integer, default=3)
    
    # Onboarding Data
    referral_source = Column(String, nullable=True)
    usage_intent = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    primary_skill = Column(String, nullable=True)
    onboarding_completed = Column(Integer, default=0) # 0 for no, 1 for yes
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    cv_history = relationship("CVHistory", back_populates="owner")
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    locations = relationship("UserLocation", back_populates="user", cascade="all, delete-orphan")
    devices = relationship("UserDevice", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    job_description = Column(Text, nullable=True) # JD text for specific position
    evaluation_criteria = Column(JSON, default={}) # Weights for different metrics
    is_archived = Column(Integer, default=0) # 0 for active, 1 for archived
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="projects")
    cv_history = relationship("CVHistory", back_populates="project")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Candidate Specifics
    preferred_working_model = Column(String, nullable=True) # remote, onsite, hybrid
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    preferred_roles = Column(String, nullable=True) # Stored as comma-separated or JSON string
    skills = Column(String, nullable=True) # Stored as comma-separated or JSON string
    career_goals = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="profile")

class UserLocation(Base):
    __tablename__ = "user_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Method: 'browser', 'ip', or 'manual'
    method = Column(String, nullable=False)
    
    # Coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True) # in meters
    
    # Address Info
    city = Column(String, nullable=True)
    region = Column(String, nullable=True)
    country = Column(String, nullable=True)
    country_code = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    
    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_current = Column(Integer, default=1) # 1 for current, 0 for history
    
    user = relationship("User", back_populates="locations")

class UserDevice(Base):
    __tablename__ = "user_devices"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    device_type = Column(String, nullable=True) # mobile, desktop, tablet
    os = Column(String, nullable=True) # iOS, Android, Windows, macOS
    browser = Column(String, nullable=True) # Chrome, Safari, Firefox
    user_agent = Column(String, nullable=True)
    
    last_seen = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="devices")

class CVHistory(Base):
    __tablename__ = "cv_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    filename = Column(String)
    text = Column(Text)
    ai_data = Column(JSON)
    ai_score = Column(JSON)
    
    # Candidate Metadata
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    seniority_level = Column(String, nullable=True)
    keywords = Column(Text, nullable=True) # Stored as comma-separated string
    score = Column(Integer, nullable=True)
    additional_notes = Column(Text, nullable=True)
    ai_content_score = Column(Float, nullable=True)
    model_used = Column(String, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="cv_history")
    project = relationship("Project", back_populates="cv_history")
