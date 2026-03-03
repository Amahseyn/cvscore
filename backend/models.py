from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
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
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="cv_history")
