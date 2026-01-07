from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserWithEmotions

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """새로운 사용자 생성"""
    try:
        # 중복 확인 (이름 + 생년월일 + 전화번호 뒷자리)
        existing_user = db.query(User).filter(
            User.name == user.name,
            User.birthdate == user.birthdate,
            User.phone_last_four == user.phone_last_four
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 등록된 사용자입니다"
            )
        
        db_user = User(
            name=user.name,
            birthdate=user.birthdate,
            phone_last_four=user.phone_last_four
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사용자 생성 중 오류 발생: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserWithEmotions)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """사용자 정보 조회 (감정 데이터 포함)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    return user

@router.get("/", response_model=List[UserResponse])
async def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """모든 사용자 목록 조회"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users
