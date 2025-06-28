from pydantic import BaseModel, EmailStr
from typing import Optional, List

# 회원가입 스키마
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # "mentor" or "mentee"

# 로그인 스키마
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 토큰 응답 스키마
class TokenResponse(BaseModel):
    token: str

# 프로필 스키마
class ProfileData(BaseModel):
    name: str
    bio: str
    imageUrl: str
    skills: Optional[List[str]] = None

# 사용자 응답 스키마
class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    profile: ProfileData

# 프로필 업데이트 스키마
class UserProfile(BaseModel):
    id: Optional[int] = None
    name: str
    role: Optional[str] = None
    bio: Optional[str] = None
    image: Optional[str] = None  # Base64 encoded string
    skills: Optional[List[str]] = None

# 매칭 요청 생성 스키마
class MatchRequestCreate(BaseModel):
    mentorId: int
    menteeId: Optional[int] = None
    message: str

# 매칭 요청 응답 스키마
class MatchRequestResponse(BaseModel):
    id: int
    mentorId: int
    menteeId: int
    message: str
    status: str
