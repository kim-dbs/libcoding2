from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional

# JWT 설정
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 1

# 패스워드 해싱 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """비밀번호 해싱"""
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    """JWT 토큰 생성"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    # RFC 7519 필수 클레임 추가
    to_encode.update({
        "iss": "mentor-mentee-app",  # issuer
        "aud": "mentor-mentee-users",  # audience
        "exp": expire,  # expiration time
        "nbf": datetime.utcnow(),  # not before
        "iat": datetime.utcnow(),  # issued at
        "jti": f"token-{datetime.utcnow().timestamp()}"  # JWT ID
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """JWT 토큰 검증"""
    try:
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM],
            audience="mentor-mentee-users",
            issuer="mentor-mentee-app"
        )
        return payload
    except JWTError:
        return None
