from sqlalchemy import Column, Integer, String, Text, LargeBinary, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # "mentor" or "mentee"
    bio = Column(Text)
    skills = Column(Text)  # comma-separated skills for mentors
    profile_image = Column(LargeBinary)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    sent_requests = relationship("MatchRequest", foreign_keys="MatchRequest.mentee_id", back_populates="mentee")
    received_requests = relationship("MatchRequest", foreign_keys="MatchRequest.mentor_id", back_populates="mentor")

class MatchRequest(Base):
    __tablename__ = "match_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mentee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="pending")  # "pending", "accepted", "rejected", "cancelled"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="received_requests")
    mentee = relationship("User", foreign_keys=[mentee_id], back_populates="sent_requests")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Integer, default=0)  # 0: 읽지 않음, 1: 읽음
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
