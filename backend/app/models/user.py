from sqlalchemy import Column, String, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    birthdate = Column(Date, nullable=False)
    phone_last_four = Column(String(4), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    emotions = relationship("Emotion", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, name={self.name})>"
