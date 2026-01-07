from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from typing import Optional

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    birthdate: date
    phone_last_four: str = Field(..., min_length=4, max_length=4)
    
    @field_validator('phone_last_four')
    @classmethod
    def validate_phone(cls, v):
        if not v.isdigit():
            raise ValueError('전화번호 뒷자리는 숫자 4자리여야 합니다')
        return v

class UserResponse(BaseModel):
    id: str
    name: str
    birthdate: date
    phone_last_four: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserWithEmotions(UserResponse):
    """감정 데이터를 포함한 사용자 응답"""
    emotions: list = []
    
    class Config:
        from_attributes = True
