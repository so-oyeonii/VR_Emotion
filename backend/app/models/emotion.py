from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class Emotion(Base):
    __tablename__ = "emotions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    emotion_name = Column(String, nullable=False)  # 분노, 즐거움, 슬픔 등
    intensity = Column(Integer, nullable=False)  # 1-10
    color = Column(String, nullable=True)  # hex color code
    sequence_order = Column(Integer, nullable=False)  # 1, 2, 3
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="emotions")
    
    def __repr__(self):
        return f"<Emotion(id={self.id}, emotion={self.emotion_name}, intensity={self.intensity})>"
