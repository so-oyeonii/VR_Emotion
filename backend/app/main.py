from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import users_router, emotions_router

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VR Emotion Research API",
    description="감정 외재화 연구를 위한 백엔드 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(users_router)
app.include_router(emotions_router)

@app.get("/")
async def root():
    return {
        "message": "VR Emotion Research API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "users": "/api/users",
            "emotions": "/api/emotions"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}
