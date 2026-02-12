# VR Emotion Research - 감정 외재화 연구 플랫폼

React + FastAPI 기반의 사회적 배제(Cyberball) 실험 및 감정 데이터 수집 플랫폼

## 프로젝트 개요

VR 기반 감정 외재화 연구를 위한 웹 데이터 수집 앱입니다. Cyberball 패러다임(Williams, 2006)을 활용하여 사회적 배제를 유도한 뒤, GEW 프레임워크 기반의 감정 측정을 수행합니다.

## 실험 흐름

```
Phase 1: 사전 설문
  ① 사용자 정보 입력 (/)
  ② AAQ-II 심리적 유연성 척도 (/aaq) — 7문항, 1-7점
  ③ PANAS 정서 척도 (/panas) — 20문항, 1-5점

Phase 2: Cyberball 게임 (/game)
  포함 단계 (1분) → 배제 단계 (2분) = 총 3분
  - 포함: ~35% 확률로 공이 옴, 에이전트 긍정 반응
  - 배제: 0% 확률, 에이전트끼리만 교류

Phase 3: 감정 측정 (/emotion)
  GEW 색상 구체로 감정 선택 (최대 3개) + 강도 1-10

Phase 4: VR 체험 (/complete → VR 헤드셋)
  웹에서 완료 후 VR 헤드셋 착용 (별도 개발)
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19 + Vite, Zustand, React Router |
| Backend | FastAPI, SQLAlchemy, SQLite |
| 게임 | Canvas API (Cyberball) |
| 감정 색상 | Jonauskaite et al. + GEW 프레임워크 |

## 프로젝트 구조

```
VR_Emotion/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── UserInfo.jsx        # 사용자 정보 입력
│       │   ├── AAQ.jsx             # AAQ-II 척도
│       │   ├── PANAS.jsx           # PANAS 척도
│       │   ├── CyberballGame.jsx   # Cyberball 게임 화면
│       │   ├── EmotionSelect.jsx   # GEW 감정 구체 선택 + 강도
│       │   └── Completion.jsx      # 완료 + VR 안내
│       ├── hooks/
│       │   └── useCyberball.js     # Cyberball 게임 로직
│       ├── store/
│       │   └── useStore.js         # Zustand 전역 상태
│       ├── services/
│       │   └── api.js              # API 통신
│       └── App.jsx                 # 라우팅
│
├── backend/
│   └── app/
│       ├── main.py                 # FastAPI 진입점
│       ├── models/                 # SQLAlchemy 모델
│       ├── schemas/                # Pydantic 스키마
│       ├── routers/                # API 엔드포인트
│       └── database.py             # DB 연결
│
└── README.md
```

## 시작하기

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Cyberball 게임 설계

| 항목 | 포함 단계 | 배제 단계 |
|------|-----------|-----------|
| 시간 | 1분 | 2분 |
| 공 확률 | ~35% | 0% |
| AI 패스 속도 | 600-1500ms | 350-750ms |
| 시각 효과 | 밝은 배경, 연결선 | 어두운 배경, 연결선 희미 |
| 플레이어 이모지 | 🙂 | 😔 |
| AI 대화 | "나이스 캐치!" 등 | "우리 둘이 계속 하자!" 등 |
| 던지기 제한 | 5초 내 선택 (자동 던지기) | - |

## 감정 색상 (GEW + Jonauskaite et al.)

| 감정 | Hex | 근거 |
|------|-----|------|
| 분노 | `#D32F2F` | 빨강-분노 73%+ |
| 슬픔 | `#1565C0` | 파랑-슬픔 일관 |
| 소외감 | `#607D8B` | 회색-슬픔 체계적 연결 |
| 수치심 | `#6A1B9A` | 어두운 보라-수치심 |
| 불안 | `#2E7D32` | 어두운 초록-부정감정 |
| 무관심 | `#8D6E63` | 갈색-낮은 각성 |
| 두려움 | `#263238` | 검정-공포 |
| 좌절감 | `#E64A19` | 주황-분노 인접 |
| 놀람 | `#F9A825` | 노랑-놀람 |
| 평온 | `#00ACC1` | 청록-차분 |

## API 엔드포인트

- `POST /api/users/` — 사용자 생성
- `GET /api/users/{id}` — 사용자 조회
- `POST /api/emotions/batch` — 감정 데이터 일괄 저장
- `GET /api/emotions/user/{id}` — 사용자 감정 조회

## 배포하기

### Vercel 배포 (프론트엔드)

1. **Vercel 프로젝트 생성**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **환경 변수 설정** (Vercel Dashboard)
   - `VITE_API_BASE_URL`: 백엔드 API URL (예: `https://your-backend.com/api`)

3. **자동 배포**: GitHub에 푸시하면 자동으로 배포됩니다

### 백엔드 배포 (Render/Railway 추천)

**Render 배포:**
1. [Render](https://render.com)에 가입
2. New Web Service 생성
3. GitHub 저장소 연결
4. 설정:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3.11+
5. 환경 변수 설정:
   - `DATABASE_URL`: PostgreSQL 연결 문자열
   - `BACKEND_CORS_ORIGINS`: `["https://your-vercel-app.vercel.app"]`

**Railway 배포:**
1. [Railway](https://railway.app)에 가입
2. New Project → Deploy from GitHub
3. PostgreSQL 추가
4. 환경 변수 자동 설정됨

### 환경 변수 파일

- `frontend/.env.example` — 프론트엔드 환경 변수 템플릿
- `backend/.env.example` — 백엔드 환경 변수 템플릿

## 라이선스

연구 목적으로 개발되었습니다.
