from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models import User, MatchRequest
from typing import Optional, List
import base64
from PIL import Image
import io

def create_user(db: Session, email: str, password_hash: str, name: str, role: str) -> User:
    """새 사용자 생성"""
    user = User(
        email=email,
        password_hash=password_hash,
        name=name,
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """이메일로 사용자 조회"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """ID로 사용자 조회"""
    return db.query(User).filter(User.id == user_id).first()

def update_user_profile(
    db: Session, user_id: int, name: str, bio: Optional[str] = None, 
    image_base64: Optional[str] = None, skills: Optional[str] = None
) -> User:
    """사용자 프로필 업데이트"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user.name = name
    if bio is not None:
        user.bio = bio
    if skills is not None:
        user.skills = skills
    
    # 이미지 처리
    if image_base64:
        try:
            # Base64 디코딩
            image_data = base64.b64decode(image_base64)
            
            # 이미지 유효성 검사
            with Image.open(io.BytesIO(image_data)) as img:
                # 이미지 크기 검사 (최대 1MB)
                if len(image_data) > 1024 * 1024:
                    raise ValueError("Image too large")
                
                # 이미지 포맷 검사
                if img.format not in ['JPEG', 'PNG']:
                    raise ValueError("Invalid image format")
                
                # 이미지 크기 조정 (500x500)
                img = img.resize((500, 500), Image.Resampling.LANCZOS)
                
                # JPEG로 변환하여 저장
                output = io.BytesIO()
                img.convert('RGB').save(output, format='JPEG', quality=85)
                user.profile_image = output.getvalue()
        except Exception as e:
            # 이미지 처리 실패시 기본 이미지 유지
            pass
    
    db.commit()
    db.refresh(user)
    return user

def get_mentors(db: Session, skill: Optional[str] = None, order_by: Optional[str] = None) -> List[User]:
    """멘토 리스트 조회"""
    query = db.query(User).filter(User.role == "mentor")
    
    # 스킬 필터링
    if skill:
        query = query.filter(User.skills.contains(skill))
    
    # 정렬
    if order_by == "name":
        query = query.order_by(User.name)
    elif order_by == "skill":
        query = query.order_by(User.skills)
    else:
        query = query.order_by(User.id)
    
    return query.all()

def create_match_request(db: Session, mentor_id: int, mentee_id: int, message: str) -> MatchRequest:
    """매칭 요청 생성"""
    # 이미 대기중인 요청이 있는지 확인
    existing_request = db.query(MatchRequest).filter(
        and_(
            MatchRequest.mentee_id == mentee_id,
            MatchRequest.status == "pending"
        )
    ).first()
    
    if existing_request:
        raise ValueError("Already have a pending request")
    
    match_request = MatchRequest(
        mentor_id=mentor_id,
        mentee_id=mentee_id,
        message=message,
        status="pending"
    )
    db.add(match_request)
    db.commit()
    db.refresh(match_request)
    return match_request

def get_incoming_requests(db: Session, mentor_id: int) -> List[MatchRequest]:
    """멘토에게 온 요청 목록"""
    return db.query(MatchRequest).filter(
        MatchRequest.mentor_id == mentor_id
    ).order_by(MatchRequest.created_at.desc()).all()

def get_outgoing_requests(db: Session, mentee_id: int) -> List[MatchRequest]:
    """멘티가 보낸 요청 목록"""
    return db.query(MatchRequest).filter(
        MatchRequest.mentee_id == mentee_id
    ).order_by(MatchRequest.created_at.desc()).all()

def update_request_status(
    db: Session, request_id: int, status: str, mentor_id: int
) -> Optional[MatchRequest]:
    """요청 상태 업데이트"""
    match_request = db.query(MatchRequest).filter(
        and_(
            MatchRequest.id == request_id,
            MatchRequest.mentor_id == mentor_id
        )
    ).first()
    
    if not match_request:
        return None
    
    match_request.status = status
    
    # 수락한 경우 다른 모든 요청 자동 거절
    if status == "accepted":
        db.query(MatchRequest).filter(
            and_(
                MatchRequest.mentor_id == mentor_id,
                MatchRequest.id != request_id,
                MatchRequest.status == "pending"
            )
        ).update({"status": "rejected"})
    
    db.commit()
    db.refresh(match_request)
    return match_request

def delete_match_request(db: Session, request_id: int, mentee_id: int) -> Optional[MatchRequest]:
    """매칭 요청 삭제 (취소)"""
    match_request = db.query(MatchRequest).filter(
        and_(
            MatchRequest.id == request_id,
            MatchRequest.mentee_id == mentee_id,
            MatchRequest.status == "pending"
        )
    ).first()
    
    if not match_request:
        return None
    
    match_request.status = "cancelled"
    db.commit()
    db.refresh(match_request)
    return match_request
