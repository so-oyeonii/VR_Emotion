# Backend - VR Emotion Research API

FastAPI 백엔드 서버

## 실행 방법

```bash
# 가상 환경 활성화
source venv/bin/activate

# 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 환경 변수 설정

`.env` 파일 생성:
```
DATABASE_URL=postgresql://user:password@localhost:5432/emotion_vr_db
SECRET_KEY=your-secret-key-here
```

## API 문서

서버 실행 후:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
