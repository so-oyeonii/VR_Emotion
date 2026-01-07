from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./emotion_vr.db"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()
