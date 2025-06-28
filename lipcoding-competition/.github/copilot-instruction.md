
# Copilot Instruction: 멘토-멘티 매칭 앱

이 문서는 **3시간** 안에 VS Code + GitHub Copilot 보이스 코딩으로 멘토‑멘티 매칭 웹 앱을 완성하기 위한 요약 가이드입니다.  
백엔드 **Python (FastAPI)** + 프런트엔드 **React (Vite)** 조합을 기본 가정으로 작성했지만, 요구사항만 만족하면 다른 언어/프레임워크도 허용됩니다.

---

## 1. 프로젝트 실행 규칙

| 서비스 | 포트 | URL |
|--------|------|-----|
| Frontend | 3000 | `http://localhost:3000` |
| Backend  | 8080 | `http://localhost:8080` |
| Backend API root | – | `http://localhost:8080/api` |

* 백엔드를 실행하면 **Swagger UI**(`http://localhost:8080/swagger-ui`) 로 자동 리다이렉트되어야 합니다.  
* OpenAPI 문서는 `http://localhost:8080/openapi.json` 에서 제공하세요.

---

## 2. 핵심 기술 스택

* **언어**: Python, JavaScript, Java, .NET 중 택 1  
* **DB**: 로컬 실행 가능하면 종류 자유 (SQLite 권장)  
* **이미지 저장**: BLOB → DB 직저장
* **보안**: SQL Injection·XSS 등 **OWASP TOP10** 대비

---

## 3. API 엔드포인트 요약 (Base path: `/api/`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| **POST** | `/signup` | 회원가입 (이메일·비밀번호·이름·role) |
| **POST** | `/login` | 로그인, `{ "token": "JWT" }` 반환 |
| **GET** | `/me` | 내 정보 조회 |
| **GET** | `/images/{role}/{id}` | 프로필 이미지 스트리밍 |
| **PUT** | `/profile` | 프로필 수정 |
| **GET** | `/mentors` | 멘토 리스트 조회 (멘티 전용) |
| **POST** | `/match-requests` | 매칭 요청 생성 (멘티 전용) |
| **GET** | `/match-requests/incoming` | 받은 요청 목록 (멘토 전용) |
| **GET** | `/match-requests/outgoing` | 보낸 요청 목록 (멘티 전용) |
| **PUT** | `/match-requests/{id}/accept` | 요청 수락 (멘토) |
| **PUT** | `/match-requests/{id}/reject` | 요청 거절 (멘토) |
| **DELETE** | `/match-requests/{id}` | 요청 취소/삭제 (멘티) |

> 모든 인증 필요 엔드포인트: `Authorization: Bearer <token>` 헤더 필수  
> 요청/응답은 **JSON** 포맷

---

## 4. JWT 클레임

필수 표준 클레임: `iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`  
추가 클레임: `name`, `email`, `role`(`mentor` \| `mentee`)  
`exp` = 발급 시각 + **1시간**

---

## 5. 도메인 모델 & 제약

### User
| 필드 | 타입 | 비고 |
|------|------|------|
| id | PK | int |
| email | string | unique |
| passwordHash | string | bcrypt |
| role | enum | mentor/mentee |
| name | string | |
| bio | string | null 가능 |
| imageData | blob | 기본 이미지 제공 |
| skills | string[] | mentor 전용 |

### MatchRequest
| 필드 | 타입 | 비고 |
|------|------|------|
| id | PK |
| mentorId | FK User.id |
| menteeId | FK User.id |
| message | string |
| status | enum | pending/accepted/rejected/cancelled|

제약:
* 멘토 1명 ↔ 멘티 1명 **동시 매칭 1건**  
* 멘티 → 멘토 **중복 요청 금지** (pending 상태 중복 불가)

---

## 6. 프로필 이미지 규칙

* 확장자: **.jpg / .png**  
* 해상도: 정사각형 500–1000px  
* 크기: ≤ **1 MB**  
* 기본 이미지  
  * 멘토: `https://placehold.co/500x500.jpg?text=MENTOR`  
  * 멘티: `https://placehold.co/500x500.jpg?text=MENTEE`

---

## 7. UI 테스트용 ID / Class

| 기능 | 요소 | Selector |
|------|------|----------|
| **Sign‑up** | email | `#email` |
| | password | `#password` |
| | role | `#role` |
| | button | `#signup` |
| **Login** | email | `#email` |
| | password | `#password` |
| | button | `#login` |
| **Profile** | name | `#name` |
| | bio | `#bio` |
| | skills | `#skillsets` |
| | photo img | `#profile-photo` |
| | photo input | `#profile` |
| | save button | `#save` |
| **Mentor List** | mentor card | `.mentor` |
| | search | `#search` |
| | sort‑by‑name | `#name` |
| | sort‑by‑skill | `#skill` |
| **Match Request** | message textarea | `#message` + `data-mentor-id` |
| | request button | `#request` |
| | status badge | `#request-status` |
| **Incoming Request** | message | `.request-message` + `mentee` attr |
| | accept | `#accept` |
| | reject | `#reject` |

---

## 8. 사용자 스토리 체크리스트

* [ ] 회원가입 후 `/` → `/login` 리다이렉트  
* [ ] 로그인 상태에 따라 `/` → `/login` 또는 `/profile`  
* [ ] 네비게이션 메뉴: 멘토(`profile`,`requests`), 멘티(`profile`,`mentors`,`requests`)  
* [ ] 멘토 프로필: 이름·소개·이미지·기술스택 등록/수정  
* [ ] 멘티 프로필: 이름·소개·이미지 등록/수정  
* [ ] 멘토 리스트 검색(Filter) & 정렬(Skill/Name)  
* [ ] 매칭 요청 생성 → 상태 변동  
* [ ] 멘토는 하나의 요청만 수락 가능 (나머지 자동 rejected)  
* [ ] 멘티는 요청 취소 가능  

---

## 9. 평가 절차

1. **API 테스트**: 백엔드만 실행, 자동 스크립트 통과해야 UI 테스트 진행  
2. **UI 테스트**: 프런트·백 둘 다 실행, ID/Class 셀렉터 검증  
3. **최종 결선**: 투표로 경품

제출 시 **GitHub Issue** 를 열어 리포지토리 URL 등록 → GitHub Actions 자동 평가  
*〆 마감 시간 이후 수정 제출 시 자동 탈락*

---

## 10. 빠른 개발 팁

* **FastAPI** + **SQLModel**(+SQLite) → 테이블 자동 생성 & Swagger UI 자동  
* **JWT**: `python-jose` 또는 `PyJWT`, `bcrypt` for hashing  
* 이미지 업로드: `Base64` 인코딩 → BLOB 저장, 추출 시 `Content-Type` 헤더 세팅  
* 멘토/멘티 인증 미들웨어에서 **role** 검사하여 접근 제어  
* 정렬 & 필터링은 `/mentors?skill=react&order_by=name` 식으로 처리  
* API 스펙에 맞춰 **Pydantic 모델** 먼저 정의 → 라우팅 구현  
* 프런트엔드: React Query + Axios + React‑Router‑DOM + JWT 저장 (localStorage)  
* 테이블 구조, API 루트, UI Selector ID 원본에 맞춰 변경 없도록 주의

---

> 본 가이드를 그대로 **copilot-instruction.md** 에 저장하면 Copilot이 요구사항을 인지하고 자동 완성精度가 향상됩니다.
