# VR Emotion Research - 감정 외재화 연구 앱

React + FastAPI 기반 풀스택 감정 데이터 수집 플랫폼

## 🎯 프로젝트 개요

VR 기반 감정 외재화 연구를 위한 데이터 수집 앱입니다. 참여자가 테트리스 게임 후 자신의 감정을 선택하고 강도를 조절하여 데이터를 제출합니다.

## 🛠️ 기술 스택

### Frontend
- **React 19** + Vite
- **Zustand** - 상태 관리
- **React Router** - 라우팅
- **Axios** - API 통신

### Backend
- **FastAPI** - Python 웹 프레임워크
- **SQLAlchemy** - ORM
- **SQLite** (개발) / **PostgreSQL** (프로덕션)
- **Pydantic** - 데이터 검증

## 📁 프로젝트 구조

```
VR_Emotion/
├── frontend/           # React 앱
│   ├── src/
│   │   ├── pages/     # 화면 컴포넌트
│   │   ├── services/  # API 호출
│   │   ├── store/     # Zustand 상태 관리
│   │   └── App.jsx
│   └── package.json
│
├── backend/           # FastAPI 서버
│   ├── app/
│   │   ├── models/    # 데이터베이스 모델
│   │   ├── schemas/   # Pydantic 스키마
│   │   ├── routers/   # API 엔드포인트
│   │   └── main.py
│   └── requirements.txt
│
└── README.md
```

## 🚀 시작하기

### Backend 실행

```bash
cd backend

# 가상 환경 활성화
source venv/bin/activate

# 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API: http://localhost:8000
- API 문서: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Frontend 실행

```bash
cd frontend

# 개발 서버 실행
npm run dev
```

Frontend: http://localhost:5173 (또는 5174)

## 📱 사용 흐름

1. **사용자 정보 입력** (`/`)
   - 이름, 생년월일, 전화번호 뒷자리 입력

2. **테트리스 게임** (`/game`)
   - 60초간 게임 진행
   - 자동으로 다음 단계로 이동

3. **감정 선택** (`/emotion`)
   - 8가지 감정 중 최대 3개 선택

4. **감정 강도 조절** (`/intensity`)
   - 각 감정의 강도를 1-10으로 설정

5. **완료** (`/complete`)
   - 데이터 저장 확인 및 요약

## 🗄️ 데이터베이스 스키마

### Users
- id (UUID)
- name (String)
- birthdate (Date)
- phone_last_four (String, 4자리)
- created_at (DateTime)

### Emotions
- id (UUID)
- user_id (FK → Users)
- emotion_name (String)
- intensity (Integer, 1-10)
- color (String, hex)
- sequence_order (Integer)
- created_at (DateTime)

## 📊 API 엔드포인트

### Users
- `POST /api/users/` - 사용자 생성
- `GET /api/users/{user_id}` - 사용자 조회
- `GET /api/users/` - 전체 사용자 목록

### Emotions
- `POST /api/emotions/` - 감정 데이터 생성
- `POST /api/emotions/batch` - 여러 감정 일괄 생성
- `GET /api/emotions/user/{user_id}` - 사용자의 감정 조회
- `GET /api/emotions/` - 전체 감정 데이터 목록

## 🎨 주요 기능

- ✅ 사용자 정보 수집 및 검증
- ✅ 테트리스 게임 (간소화 버전)
- ✅ 감정 휠 (8가지 감정 선택)
- ✅ 슬라이더 기반 감정 강도 조절
- ✅ 실시간 데이터 저장
- ✅ 반응형 UI
- ✅ 진행 상황 표시

## 🔧 환경 변수

### Backend (`.env`)
```
DATABASE_URL=sqlite:///./emotion_vr.db
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## 📝 개발 가이드

자세한 개발 가이드는 [`DEVELOPMENT_V2.md`](DEVELOPMENT_V2.md)를 참고하세요.

## 👥 연구 목적

이 앱은 VR 기반 감정 외재화 연구를 위한 데이터 수집 도구입니다. 
수집된 데이터는 연구 목적으로만 사용되며, 개인정보는 안전하게 보호됩니다.

## 📄 라이선스

이 프로젝트는 연구 목적으로 개발되었습니다.