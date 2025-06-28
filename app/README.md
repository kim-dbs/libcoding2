# 멘토-멘티 매칭 앱 백엔드

FastAPI 기반 멘토-멘티 매칭 앱의 백엔드 API입니다.

## 실행 방법

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 애플리케이션 실행

```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

또는

```bash
python main.py
```

### 3. API 문서 확인

브라우저에서 다음 URL로 접속:
- Swagger UI: http://localhost:8080/
- OpenAPI JSON: http://localhost:8080/openapi.json
- ReDoc: http://localhost:8080/redoc

## API 엔드포인트

### 인증
- `POST /api/signup` - 회원가입
- `POST /api/login` - 로그인

### 사용자 정보
- `GET /api/me` - 내 정보 조회
- `PUT /api/profile` - 프로필 수정
- `GET /api/images/{role}/{id}` - 프로필 이미지

### 멘토 목록
- `GET /api/mentors` - 멘토 리스트 조회 (멘티 전용)

### 매칭 요청
- `POST /api/match-requests` - 매칭 요청 보내기 (멘티 전용)
- `GET /api/match-requests/incoming` - 받은 요청 목록 (멘토 전용)
- `GET /api/match-requests/outgoing` - 보낸 요청 목록 (멘티 전용)
- `PUT /api/match-requests/{id}/accept` - 요청 수락 (멘토 전용)
- `PUT /api/match-requests/{id}/reject` - 요청 거절 (멘토 전용)
- `DELETE /api/match-requests/{id}` - 요청 취소 (멘티 전용)

## 데이터베이스

SQLite 데이터베이스를 사용하며, 앱 실행시 자동으로 테이블이 생성됩니다.

## 기능

- JWT 기반 인증
- 역할 기반 접근 제어 (멘토/멘티)
- 프로필 이미지 업로드
- 매칭 요청 관리
- 멘토 검색 및 필터링
