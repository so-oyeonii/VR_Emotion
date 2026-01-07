from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class EmotionCreate(BaseModel):
    user_id: str
    emotion_name: str = Field(..., min_length=1, max_length=50)
    intensity: int = Field(..., ge=1, le=10)
    color: Optional[str] = None
    sequence_order: int = Field(..., ge=1)
    
    @field_validator('intensity')
    @classmethod
    def validate_intensity(cls, v):
        if not 1 <= v <= 10:
            raise ValueError('강도는 1부터 10 사이여야 합니다')
        return v

class EmotionResponse(BaseModel):
    id: str
    user_id: str
    emotion_name: str
    intensity: int
    color: Optional[str]
    sequence_order: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class EmotionBatchCreate(BaseModel):
    """여러 감정을 한번에 생성"""
    user_id: str
    emotions: list[EmotionCreate]
