# DEVELOPMENT_V2.md - React + FastAPI 풀스택 개발 가이드

VR 기반 감정 외재화 연구 - 프로덕션 준비 풀스택 구현

## 🎯 프로젝트 개요

**Version B: 프로덕션 준비 버전**
- **Frontend**: React 18 + Vite + Zustand + Axios + React Router
- **Backend**: FastAPI + PostgreSQL + SQLAlchemy + Pydantic
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)
- **개발 기간**: 1-2주
- **목적**: IRB 승인 후 실제 실험용, 60-100명 데이터 수집

---

## 📁 최종 프로젝트 구조

```
emotion-vr-research/
├── frontend/                    # React + Vite
│   ├── public/
│   ├── src/
│   │   ├── components/         # 재사용 컴포넌트
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/              # 화면별 페이지
│   │   │   ├── UserInfo.jsx    # 화면 00
│   │   │   ├── TetrisGame.jsx  # 화면 01
│   │   │   ├── EmotionWheel.jsx # 화면 02
│   │   │   ├── IntensitySlider.jsx # 화면 03
│   │   │   └── Completion.jsx  # 완료 화면
│   │   ├── hooks/              # Custom Hooks
│   │   │   ├── useTetris.js
│   │   │   ├── useEmotionWheel.js
│   │   │   └── useApi.js
│   │   ├── store/              # Zustand 상태 관리
│   │   │   └── useStore.js
│   │   ├── services/           # API 호출
│   │   │   └── api.js
│   │   ├── utils/              # 유틸리티 함수
│   │   │   └── validators.js
│   │   ├── styles/             # CSS Modules
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/                     # FastAPI
│   ├── app/
│   │   ├── main.py             # FastAPI 앱 진입점
│   │   ├── models/             # SQLAlchemy 모델
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── emotion.py
│   │   ├── schemas/            # Pydantic 스키마
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── emotion.py
│   │   ├── routers/            # API 엔드포인트
│   │   │   ├── __init__.py
│   │   │   ├── users.py
│   │   │   └── emotions.py
│   │   ├── database.py         # DB 연결
│   │   └── config.py           # 환경 변수
│   ├── alembic/                # DB 마이그레이션
│   │   └── versions/
│   ├── requirements.txt
│   └── README.md
│
├── .gitignore
├── docker-compose.yml          # 로컬 개발용
└── README.md                   # 프로젝트 루트
```

---

## 📋 Phase 0: 프로젝트 초기 세팅

### 0.1 필수 도구 설치 확인
```bash
# Node.js 18+ 확인
node --version  # v18.0.0 이상

# Python 3.9+ 확인
python --version  # 3.9 이상

# PostgreSQL 설치 (또는 Docker 사용)
psql --version
```

### 0.2 프로젝트 생성
**Copilot 프롬프트:**
```bash
# 루트 디렉토리 생성
mkdir emotion-vr-research && cd emotion-vr-research

# Frontend: Vite + React 생성
npm create vite@latest frontend -- --template react
cd frontend
npm install

# 추가 패키지 설치
npm install zustand axios react-router-dom

cd ..

# Backend: FastAPI 프로젝트 생성
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# requirements.txt 생성
# Create requirements.txt with:
# fastapi==0.104.1
# uvicorn[standard]==0.24.0
# sqlalchemy==2.0.23
# psycopg2-binary==2.9.9
# alembic==1.12.1
# python-dotenv==1.0.0
# pydantic==2.5.0
# python-multipart==0.0.6

pip install -r requirements.txt
```

### 0.3 Git 초기화
```bash
cd emotion-vr-research
git init
# Create .gitignore for Python, Node, PostgreSQL
```

---

## 📋 Phase 1: 백엔드 API 구조 설계

### 1.1 데이터베이스 모델 (backend/app/models/user.py)
**Copilot 프롬프트:**
```python
# Create SQLAlchemy User model with:
# - id: UUID primary key
# - name: String
# - birthdate: Date
# - phone_last_four: String (4 digits)
# - created_at: DateTime with default
# - emotions: relationship to Emotion model
```

### 1.2 데이터베이스 모델 (backend/app/models/emotion.py)
**Copilot 프롬프트:**
```python
# Create SQLAlchemy Emotion model with:
# - id: UUID primary key
# - user_id: UUID foreign key to users
# - emotion_name: String (분노, 즐거움, 슬픔 등)
# - intensity: Integer (1-10)
# - color: String (hex color code)
# - sequence_order: Integer (1, 2, 3)
# - created_at: DateTime
# - user: relationship back to User
```

### 1.3 Pydantic 스키마 (backend/app/schemas/user.py)
**Copilot 프롬프트:**
```python
# Create Pydantic schemas:
# 1. UserCreate (name, birthdate, phone_last_four)
# 2. UserResponse (id, name, birthdate, created_at)
# 3. Add validators for phone_last_four (must be 4 digits)
```

### 1.4 Pydantic 스키마 (backend/app/schemas/emotion.py)
**Copilot 프롬프트:**
```python
# Create Pydantic schemas:
# 1. EmotionCreate (user_id, emotion_name, intensity, color, sequence_order)
# 2. EmotionResponse (id, user_id, emotion_name, intensity, created_at)
# 3. Add validators for intensity (1-10 range)
```

### 1.5 데이터베이스 연결 (backend/app/database.py)
**Copilot 프롬프트:**
```python
# Create database connection with SQLAlchemy:
# - DATABASE_URL from environment variable
# - Create engine with pool settings
# - SessionLocal with autocommit=False
# - Base declarative class
# - get_db() dependency function for FastAPI
```

### 1.6 환경 설정 (backend/app/config.py)
**Copilot 프롬프트:**
```python
# Create Pydantic Settings class:
# - DATABASE_URL: str
# - SECRET_KEY: str
# - CORS_ORIGINS: list
# - Load from .env file
```

### 1.7 User API 라우터 (backend/app/routers/users.py)
**Copilot 프롬프트:**
```python
# Create FastAPI router for users:
# POST /api/users - Create new user
# GET /api/users/{user_id} - Get user by ID
# GET /api/users - List all users (admin only, later)
# Include request validation and error handling
```

### 1.8 Emotion API 라우터 (backend/app/routers/emotions.py)
**Copilot 프롬프트:**
```python
# Create FastAPI router for emotions:
# POST /api/emotions - Create emotion record (can receive list)
# GET /api/emotions/user/{user_id} - Get all emotions for a user
# POST /api/emotions/batch - Create multiple emotions at once
```

### 1.9 FastAPI 메인 앱 (backend/app/main.py)
**Copilot 프롬프트:**
```python
# Create FastAPI application:
# 1. Import routers (users, emotions)
# 2. Configure CORS middleware (allow frontend origin)
# 3. Include routers with prefix "/api"
# 4. Add root endpoint GET / with welcome message
# 5. Add health check endpoint GET /health
# 6. Create database tables on startup
```

---

## 📋 Phase 2: 프론트엔드 라우팅 및 레이아웃

### 2.1 Vite 설정 (frontend/vite.config.js)
**Copilot 프롬프트:**
```javascript
// Configure Vite:
// 1. Proxy API requests to localhost:8000
// 2. Set port to 5173
// 3. Configure path aliases (@/ -> src/)
```

### 2.2 환경 변수 (frontend/.env)
**Copilot 프롬프트:**
```bash
# Create .env file:
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2.3 API 서비스 (frontend/src/services/api.js)
**Copilot 프롬프트:**
```javascript
// Create Axios instance with:
// 1. Base URL from environment variable
// 2. Request interceptor for adding headers
// 3. Response interceptor for error handling
// 4. Export functions:
//    - createUser(userData)
//    - createEmotions(emotionsData)
//    - getUserEmotions(userId)
```

### 2.4 Zustand 스토어 (frontend/src/store/useStore.js)
**Copilot 프롬프트:**
```javascript
// Create Zustand store with:
// 1. userData: { name, birthdate, phone_last_four, userId }
// 2. selectedEmotions: [{ emotion, color }, ...]
// 3. emotionIntensities: [{ emotion, intensity, color }, ...]
// 4. currentScreen: number (0-3)
// 5. Actions:
//    - setUserData(data)
//    - addSelectedEmotion(emotion, color)
//    - setIntensity(index, intensity)
//    - nextScreen()
//    - resetStore()
```

### 2.5 라우터 설정 (frontend/src/App.jsx)
**Copilot 프롬프트:**
```javascript
// Create React Router setup:
// 1. Use createBrowserRouter
// 2. Routes:
//    - / -> UserInfo
//    - /game -> TetrisGame
//    - /emotion -> EmotionWheel
//    - /intensity -> IntensitySlider
//    - /complete -> Completion
// 3. Wrap with ErrorBoundary
// 4. Add protected route logic (can't skip screens)
```

### 2.6 레이아웃 컴포넌트 (frontend/src/components/Layout.jsx)
**Copilot 프롬프트:**
```javascript
// Create Layout component:
// 1. Space-themed background (CSS with stars animation)
// 2. Progress bar showing current screen (0-3)
// 3. Container for children
// 4. Responsive design (mobile-friendly)
```

---

## 📋 Phase 3: 화면 00 - 사용자 정보 입력

### 3.1 UserInfo 컴포넌트 (frontend/src/pages/UserInfo.jsx)
**Copilot 프롬프트:**
```javascript
// Create UserInfo page component:
// 1. Form with inputs: name, birthdate (date picker), phone last 4 digits
// 2. Validation: all fields required, phone must be 4 digits
// 3. On submit:
//    - Call api.createUser()
//    - Store userId and data in Zustand
//    - Navigate to /game
// 4. Retro game-style design
// 5. Loading state during API call
// 6. Error handling with toast/alert
```

### 3.2 스타일 (frontend/src/pages/UserInfo.module.css)
**Copilot 프롬프트:**
```css
/* Create CSS Module for UserInfo:
1. Form panel: semi-transparent, centered
2. Retro pixel-style inputs
3. Animated submit button
4. Mobile responsive (max-width: 600px)
5. Focus states with glow effect
*/
```

---

## 📋 Phase 4: 화면 01 - 테트리스 게임

### 4.1 useTetris Hook (frontend/src/hooks/useTetris.js)
**Copilot 프롬프트:**
```javascript
// Create custom hook useTetris:
// 1. State: board (10x20), currentPiece, score, gameOver, gameTime
// 2. Tetromino shapes (I, O, T, S, Z, J, L) with colors
// 3. Logic:
//    - initGame()
//    - movePiece(direction)
//    - rotatePiece()
//    - checkCollision()
//    - lockPiece()
//    - clearLines()
//    - gameLoop() with requestAnimationFrame
// 4. Special chaos mode after 60 seconds:
//    - Rapidly drop random pieces
//    - Stack uncontrollably
//    - Trigger error after 5 seconds
// 5. Return: board, score, gameOver, controls, startGame
```

### 4.2 TetrisGame 컴포넌트 (frontend/src/pages/TetrisGame.jsx)
**Copilot 프롬프트:**
```javascript
// Create TetrisGame page component:
// 1. Use useTetris hook
// 2. Canvas element (320x640) for game board
// 3. Draw tetrominos and board
// 4. Display score
// 5. Keyboard event listeners (arrow keys, space)
// 6. System error modal (appears after chaos mode)
// 7. Modal message: "게임 그만하고 조금 쉬세요!"
// 8. Auto-navigate to /emotion after error shown (5s delay)
// 9. useEffect cleanup on unmount
```

### 4.3 스타일 (frontend/src/pages/TetrisGame.module.css)
**Copilot 프롬프트:**
```css
/* Create CSS Module for TetrisGame:
1. Canvas: centered, neon border glow
2. Score display: top-right, retro font
3. Error modal: full screen, red glitch effect
4. Shake animation keyframes
5. Flickering text effect
*/
```

---

## 📋 Phase 5: 화면 02 - 감정 룰렛

### 5.1 useEmotionWheel Hook (frontend/src/hooks/useEmotionWheel.js)
**Copilot 프롬프트:**
```javascript
// Create custom hook useEmotionWheel:
// 1. Emotions: [
//      { name: '분노', color: '#FF0000' },
//      { name: '즐거움', color: '#FFFF00' },
//      { name: '슬픔', color: '#0000FF' },
//      { name: '공포', color: '#800080' },
//      { name: '행복', color: '#00FF00' }
//    ]
// 2. State: selectedEmotions (array), currentSpin (0-2), isSpinning
// 3. Predefined sequence: [분노, 즐거움, 슬픔]
// 4. spinWheel() function:
//    - Animate rotation (CSS)
//    - Select next in sequence
//    - Add to selectedEmotions
//    - Store in Zustand
// 5. After 3 spins, navigate to /intensity
// 6. Return: emotions, selectedEmotions, currentSpin, spinWheel, isSpinning
```

### 5.2 EmotionWheel 컴포넌트 (frontend/src/pages/EmotionWheel.jsx)
**Copilot 프롬프트:**
```javascript
// Create EmotionWheel page component:
// 1. Use useEmotionWheel hook
// 2. SVG circle wheel (400x400 viewBox)
// 3. Draw 5 equal pie slices with emotion colors
// 4. Rotation animation with CSS transition
// 5. Pointer/arrow at top
// 6. Spin button (disabled during spin)
// 7. Display selected emotions as colored chips below
// 8. Show "X/3 선택 완료" counter
// 9. Note: Emotion names NOT visible on wheel (only colors)
```

### 5.3 스타일 (frontend/src/pages/EmotionWheel.module.css)
**Copilot 프롬프트:**
```css
/* Create CSS Module for EmotionWheel:
1. Wheel: centered, drop-shadow, smooth rotation
2. Pie slices: vibrant gradients
3. Spin button: large, pulsing animation
4. Selected emotion chips: flex row, rounded, colored badges
5. Pointer: triangle at top of wheel
6. Rotation keyframes with easing
*/
```

---

## 📋 Phase 6: 화면 03 - 감정 강도 조절

### 6.1 IntensitySlider 컴포넌트 (frontend/src/pages/IntensitySlider.jsx)
**Copilot 프롬프트:**
```javascript
// Create IntensitySlider page component:
// 1. Get selectedEmotions from Zustand
// 2. State: currentEmotionIndex (0-2), intensity (1-10)
// 3. Display current emotion name and color
// 4. 3D bubble visualization (CSS sphere with glow)
// 5. Bubble size scales: 50px (intensity 1) -> 300px (intensity 10)
// 6. Range slider: min="1" max="10" value={intensity}
// 7. On slider change, update bubble size in real-time
// 8. "확인 및 다음" button:
//    - Store {emotion, intensity, color} in Zustand
//    - Move to next emotion or completion
// 9. After 3rd emotion:
//    - Call api.createEmotions() with all data
//    - Navigate to /complete
// 10. Show loading during API call
// 11. Error handling
```

### 6.2 스타일 (frontend/src/pages/IntensitySlider.module.css)
**Copilot 프롬프트:**
```css
/* Create CSS Module for IntensitySlider:
1. .bubble: 3D sphere with border-radius: 50%
2. Radial gradient for depth effect
3. Box-shadow for glow (color matches emotion)
4. Smooth scale transition (0.3s ease)
5. Range slider: custom track and thumb
6. Slider thumb color matches emotion
7. Emotion name: large text, centered above bubble
8. Slider container: full width, padding
*/
```

---

## 📋 Phase 7: 완료 화면

### 7.1 Completion 컴포넌트 (frontend/src/pages/Completion.jsx)
**Copilot 프롬프트:**
```javascript
// Create Completion page component:
// 1. Get emotionIntensities and userData from Zustand
// 2. Display success message: "VR 체험 준비가 완료되었습니다!"
// 3. Show summary:
//    - User name
//    - Selected emotions with intensities
//    - Date/time of completion
// 4. Optional: Confetti animation
// 5. Button: "VR 헤드셋 착용하기" (just visual, no action)
// 6. Button: "새로운 참가자 시작" -> Reset store and go to /
```

### 7.2 스타일 (frontend/src/pages/Completion.module.css)
**Copilot 프롬프트:**
```css
/* Create CSS Module for Completion:
1. Success container: centered, animated entrance
2. Checkmark icon: large, green, animated
3. Summary card: transparent panel, rounded corners
4. Emotion list: colored badges with intensities
5. Buttons: large, hover effects
6. Confetti: optional CSS animation
*/
```

---

## 📋 Phase 8: 유틸리티 및 공통 컴포넌트

### 8.1 로딩 스피너 (frontend/src/components/LoadingSpinner.jsx)
**Copilot 프롬프트:**
```javascript
// Create reusable LoadingSpinner component:
// 1. Animated spinner (CSS)
// 2. Optional text prop
// 3. Overlay variant for full-screen loading
```

### 8.2 에러 바운더리 (frontend/src/components/ErrorBoundary.jsx)
**Copilot 프롬프트:**
```javascript
// Create ErrorBoundary class component:
// 1. Catch React errors
// 2. Display fallback UI with error message
// 3. "다시 시도" button to reset state
// 4. Log errors to console (later: send to backend)
```

### 8.3 Validators (frontend/src/utils/validators.js)
**Copilot 프롬프트:**
```javascript
// Create validation functions:
// 1. validateName(name) - not empty, max 50 chars
// 2. validateBirthdate(date) - valid date, age 18+
// 3. validatePhone(phone) - exactly 4 digits
// 4. validateIntensity(intensity) - 1-10 range
```

---

## 📋 Phase 9: 데이터베이스 마이그레이션

### 9.1 Alembic 초기화 (backend/)
**Copilot 프롬프트:**
```bash
# Initialize Alembic:
cd backend
alembic init alembic

# Edit alembic.ini:
# Set sqlalchemy.url = postgresql://user:pass@localhost/emotion_vr_db

# Edit alembic/env.py:
# Import Base from app.models
# Set target_metadata = Base.metadata
```

### 9.2 첫 마이그레이션 생성
**Copilot 프롬프트:**
```bash
# Create migration:
alembic revision --autogenerate -m "create users and emotions tables"

# Apply migration:
alembic upgrade head
```

---

## 📋 Phase 10: 로컬 개발 환경 설정

### 10.1 Docker Compose (docker-compose.yml)
**Copilot 프롬프트:**
```yaml
# Create docker-compose.yml:
# Services:
# 1. postgres:
#    - image: postgres:15
#    - environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
#    - ports: 5432:5432
#    - volumes: postgres_data
# 2. backend:
#    - build: ./backend
#    - ports: 8000:8000
#    - depends_on: postgres
#    - environment: DATABASE_URL
#    - command: uvicorn app.main:app --reload --host 0.0.0.0
# 3. frontend:
#    - build: ./frontend
#    - ports: 5173:5173
#    - volumes: ./frontend:/app
#    - command: npm run dev
```

### 10.2 Backend Dockerfile (backend/Dockerfile)
**Copilot 프롬프트:**
```dockerfile
# Create Dockerfile for FastAPI:
# FROM python:3.11-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 10.3 Frontend Dockerfile (frontend/Dockerfile)
**Copilot 프롬프트:**
```dockerfile
# Create Dockerfile for Vite:
# FROM node:18-alpine
# WORKDIR /app
# COPY package*.json .
# RUN npm install
# COPY . .
# EXPOSE 5173
# CMD ["npm", "run", "dev", "--", "--host"]
```

---

## 📋 Phase 11: 배포 준비

### 11.1 프론트엔드 배포 (Vercel)
**Copilot 프롬프트:**
```bash
# Install Vercel CLI:
npm i -g vercel

# Deploy:
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_API_BASE_URL=https://your-backend.railway.app/api
```

### 11.2 백엔드 배포 (Railway/Render)
**Copilot 프롬프트:**
```bash
# For Railway:
# 1. Connect GitHub repo
# 2. Select backend directory
# 3. Add PostgreSQL plugin
# 4. Set environment variables:
#    - DATABASE_URL (auto-generated)
#    - SECRET_KEY
#    - CORS_ORIGINS=https://your-frontend.vercel.app

# For Render:
# 1. Create new Web Service
# 2. Connect repo, root directory: backend
# 3. Build command: pip install -r requirements.txt
# 4. Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
# 5. Add PostgreSQL database
# 6. Set environment variables
```

---

## 🎮 개발 워크플로우

### 로컬 개발 시작
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: PostgreSQL (또는 Docker)
docker-compose up postgres
```

### 개발 순서
1. **Week 1**: Phase 1-3 (백엔드 API + 사용자 입력)
2. **Week 1-2**: Phase 4-7 (나머지 화면들)
3. **Week 2**: Phase 8-11 (유틸리티, DB, 배포)

---

## 🧪 테스트 체크리스트

### 백엔드 테스트
- [ ] POST /api/users - 사용자 생성 성공
- [ ] POST /api/emotions - 감정 데이터 저장 성공
- [ ] GET /api/emotions/user/{id} - 데이터 조회 성공
- [ ] 잘못된 데이터 입력 시 400 에러 반환
- [ ] CORS 설정 정상 작동

### 프론트엔드 테스트
- [ ] 사용자 정보 입력 → 검증 정상 작동
- [ ] 테트리스 60초 후 에러 발생
- [ ] 감정 룰렛 정확히 3번 회전
- [ ] 강도 슬라이더 실시간 버블 크기 변경
- [ ] API 호출 성공 후 완료 화면 표시
- [ ] 새로고침 시 데이터 유지 (Zustand persist 추가 가능)
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)

---

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone <your-repo-url>
cd emotion-vr-research
```

### 2. 백엔드 설정
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# .env 파일 생성
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/emotion_vr_db" > .env
echo "SECRET_KEY=your-secret-key-here" >> .env
echo "CORS_ORIGINS=http://localhost:5173" >> .env

# DB 마이그레이션
alembic upgrade head

# 서버 시작
uvicorn app.main:app --reload
```

### 3. 프론트엔드 설정
```bash
cd frontend
npm install

# .env 파일 생성
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# 개발 서버 시작
npm run dev
```

### 4. 브라우저에서 확인
- Frontend: http://localhost:5173
- Backend API Docs: http://localhost:8000/docs

---

## 💡 Copilot 사용 팁 (Version B)

### 백엔드 작업 시
1. 파일 열기 → 프롬프트를 주석으로 붙여넣기
2. Copilot이 코드 생성 → Tab으로 수락
3. 터미널에서 `uvicorn app.main:app --reload` 실행
4. http://localhost:8000/docs에서 API 테스트

### 프론트엔드 작업 시
1. 컴포넌트 파일 생성 → 프롬프트 주석 추가
2. Copilot 생성 → 브라우저에서 즉시 확인 (HMR)
3. 필요시 CSS Module도 Copilot에게 생성 요청

---

## 📊 데이터 분석 준비

### CSV 내보내기 엔드포인트 추가 (나중에)
**Copilot 프롬프트:**
```python
# In backend/app/routers/emotions.py:
# GET /api/emotions/export/csv
# - Query all emotions with user data
# - Convert to pandas DataFrame
# - Return CSV file for download
# - For SPSS/R analysis
```

---

## 🎯 Version B의 장점

✅ **확장성**: 새로운 화면/기능 추가 쉬움  
✅ **유지보수**: 컴포넌트 기반, 코드 재사용  
✅ **데이터 관리**: PostgreSQL + SQLAlchemy로 안전한 데이터 저장  
✅ **상태 관리**: Zustand로 깔끔한 전역 상태  
✅ **API 통신**: Axios interceptor로 에러 처리 일관성  
✅ **배포 준비**: Vercel + Railway로 쉬운 배포  
✅ **팀 협업**: Frontend/Backend 분리로 역할 분담 가능  

---

이제 Phase별로 진행하시면 완벽한 풀스택 앱이 완성됩니다! 🚀

질문이나 막히는 부분이 있으면 언제든 물어보세요!
