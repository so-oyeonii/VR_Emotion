from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.emotion import Emotion
from app.models.user import User
from app.schemas.emotion import EmotionCreate, EmotionResponse

router = APIRouter(prefix="/api/emotions", tags=["emotions"])

@router.post("/", response_model=EmotionResponse, status_code=status.HTTP_201_CREATED)
async def create_emotion(emotion: EmotionCreate, db: Session = Depends(get_db)):
    """단일 감정 데이터 생성"""
    # 사용자 존재 확인
    user = db.query(User).filter(User.id == emotion.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    try:
        db_emotion = Emotion(
            user_id=emotion.user_id,
            emotion_name=emotion.emotion_name,
            intensity=emotion.intensity,
            color=emotion.color,
            sequence_order=emotion.sequence_order
        )
        db.add(db_emotion)
        db.commit()
        db.refresh(db_emotion)
        return db_emotion
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"감정 데이터 생성 중 오류 발생: {str(e)}"
        )

@router.post("/batch", response_model=List[EmotionResponse], status_code=status.HTTP_201_CREATED)
async def create_emotions_batch(
    user_id: str,
    emotions: List[EmotionCreate],
    db: Session = Depends(get_db)
):
    """여러 감정 데이터를 한번에 생성"""
    # 사용자 존재 확인
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    try:
        db_emotions = []
        for emotion in emotions:
            db_emotion = Emotion(
                user_id=user_id,
                emotion_name=emotion.emotion_name,
                intensity=emotion.intensity,
                color=emotion.color,
                sequence_order=emotion.sequence_order
            )
            db_emotions.append(db_emotion)
            db.add(db_emotion)
        
        db.commit()
        for emotion in db_emotions:
            db.refresh(emotion)
        return db_emotions
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"감정 데이터 일괄 생성 중 오류 발생: {str(e)}"
        )

@router.get("/user/{user_id}", response_model=List[EmotionResponse])
async def get_user_emotions(user_id: str, db: Session = Depends(get_db)):
    """특정 사용자의 모든 감정 데이터 조회"""
    # 사용자 존재 확인
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    emotions = db.query(Emotion).filter(
        Emotion.user_id == user_id
    ).order_by(Emotion.sequence_order).all()
    return emotions

@router.get("/", response_model=List[EmotionResponse])
async def list_emotions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """모든 감정 데이터 조회"""
    emotions = db.query(Emotion).offset(skip).limit(limit).all()
    return emotions
