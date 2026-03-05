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
    created_at = Column(DateTime, default=datetime.utcnow)
    
    cv_history = relationship("CVHistory", back_populates="owner")

class CVHistory(Base):
    __tablename__ = "cv_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
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
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="cv_history")
