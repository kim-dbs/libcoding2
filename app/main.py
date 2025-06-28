from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
import io

from database import get_db, init_db
from models import User, MatchRequest
from schemas import (
    UserSignup, UserLogin, UserProfile, UserResponse, 
    MatchRequestCreate, MatchRequestResponse, TokenResponse
)
from auth import create_access_token, verify_token, get_password_hash, verify_password
from crud import (
    create_user, get_user_by_email, get_user_by_id,
    update_user_profile, get_mentors,
    create_match_request, get_incoming_requests, get_outgoing_requests,
    update_request_status, delete_match_request
)

app = FastAPI(
    title="멘토-멘티 매칭 앱 API",
    description="멘토와 멘티를 매칭하는 웹 애플리케이션의 백엔드 API",
    version="1.0.0",
    docs_url="/swagger-ui",
    redoc_url="/redoc",
    openapi_url="/v3/api-docs"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 보안 스키마
security = HTTPBearer()

# 데이터베이스 초기화
@app.on_event("startup")
async def startup_event():
    init_db()

# 현재 사용자 가져오기
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    user_data = verify_token(token)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = get_user_by_id(db, user_data["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

# 1. 인증 엔드포인트
@app.post("/api/signup", status_code=201)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    # 이메일 중복 확인
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 사용자 생성
    hashed_password = get_password_hash(user_data.password)
    create_user(db, user_data.email, hashed_password, user_data.name, user_data.role)
    
    return {"message": "User created successfully"}

@app.post("/api/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, user_data.email)
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role
    })
    
    return {"token": token}

# 2. 사용자 정보 엔드포인트
@app.get("/api/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        profile={
            "name": current_user.name,
            "bio": current_user.bio or "",
            "imageUrl": f"/api/images/{current_user.role}/{current_user.id}",
            "skills": current_user.skills.split(",") if current_user.skills else []
        }
    )

@app.put("/api/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_user = update_user_profile(
        db, current_user.id, profile_data.name, profile_data.bio,
        profile_data.image, ",".join(profile_data.skills) if profile_data.skills else None
    )
    
    return UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        role=updated_user.role,
        profile={
            "name": updated_user.name,
            "bio": updated_user.bio or "",
            "imageUrl": f"/api/images/{updated_user.role}/{updated_user.id}",
            "skills": updated_user.skills.split(",") if updated_user.skills else []
        }
    )

@app.get("/api/images/{role}/{user_id}")
async def get_profile_image(
    role: str, user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.profile_image:
        return StreamingResponse(
            io.BytesIO(user.profile_image),
            media_type="image/jpeg"
        )
    else:
        # 기본 이미지 리다이렉트
        placeholder_url = f"https://placehold.co/500x500.jpg?text={role.upper()}"
        return RedirectResponse(url=placeholder_url)

# 3. 멘토 리스트 조회
@app.get("/api/mentors", response_model=List[UserResponse])
async def get_mentors_list(
    skill: Optional[str] = None,
    order_by: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "mentee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentees can access mentor list"
        )
    
    mentors = get_mentors(db, skill, order_by)
    
    return [
        UserResponse(
            id=mentor.id,
            email=mentor.email,
            role=mentor.role,
            profile={
                "name": mentor.name,
                "bio": mentor.bio or "",
                "imageUrl": f"/api/images/{mentor.role}/{mentor.id}",
                "skills": mentor.skills.split(",") if mentor.skills else []
            }
        ) for mentor in mentors
    ]

# 4. 매칭 요청 엔드포인트
@app.post("/api/match-requests", response_model=MatchRequestResponse)
async def create_match_request_endpoint(
    request_data: MatchRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "mentee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentees can send match requests"
        )
    
    # 멘토 존재 확인
    mentor = get_user_by_id(db, request_data.mentorId)
    if not mentor or mentor.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentor not found"
        )
    
    match_request = create_match_request(
        db, request_data.mentorId, current_user.id, request_data.message
    )
    
    return MatchRequestResponse(
        id=match_request.id,
        mentorId=match_request.mentor_id,
        menteeId=match_request.mentee_id,
        message=match_request.message,
        status=match_request.status
    )

@app.get("/api/match-requests/incoming", response_model=List[MatchRequestResponse])
async def get_incoming_requests_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors can access incoming requests"
        )
    
    requests = get_incoming_requests(db, current_user.id)
    
    return [
        MatchRequestResponse(
            id=req.id,
            mentorId=req.mentor_id,
            menteeId=req.mentee_id,
            message=req.message,
            status=req.status
        ) for req in requests
    ]

@app.get("/api/match-requests/outgoing", response_model=List[MatchRequestResponse])
async def get_outgoing_requests_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "mentee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentees can access outgoing requests"
        )
    
    requests = get_outgoing_requests(db, current_user.id)
    
    return [
        MatchRequestResponse(
            id=req.id,
            mentorId=req.mentor_id,
            menteeId=req.mentee_id,
            message=req.message,
            status=req.status
        ) for req in requests
    ]

@app.put("/api/match-requests/{request_id}/accept", response_model=MatchRequestResponse)
async def accept_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors can accept requests"
        )
    
    updated_request = update_request_status(db, request_id, "accepted", current_user.id)
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    return MatchRequestResponse(
        id=updated_request.id,
        mentorId=updated_request.mentor_id,
        menteeId=updated_request.mentee_id,
        message=updated_request.message,
        status=updated_request.status
    )

@app.put("/api/match-requests/{request_id}/reject", response_model=MatchRequestResponse)
async def reject_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors can reject requests"
        )
    
    updated_request = update_request_status(db, request_id, "rejected", current_user.id)
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    return MatchRequestResponse(
        id=updated_request.id,
        mentorId=updated_request.mentor_id,
        menteeId=updated_request.mentee_id,
        message=updated_request.message,
        status=updated_request.status
    )

@app.delete("/api/match-requests/{request_id}", response_model=MatchRequestResponse)
async def cancel_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "mentee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentees can cancel requests"
        )
    
    cancelled_request = delete_match_request(db, request_id, current_user.id)
    if not cancelled_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    return MatchRequestResponse(
        id=cancelled_request.id,
        mentorId=cancelled_request.mentor_id,
        menteeId=cancelled_request.mentee_id,
        message=cancelled_request.message,
        status=cancelled_request.status
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
