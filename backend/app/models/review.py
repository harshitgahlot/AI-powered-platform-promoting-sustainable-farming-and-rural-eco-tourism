from datetime import datetime
from sqlalchemy import String, ForeignKey, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Review(Base):
    __tablename__ = "reviews"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_type: Mapped[str] = mapped_column(String(20), nullable=False) # farm, homestay, product
    target_id: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(String(1000), nullable=False)
    sentiment_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False) # scored between -1.0 and 1.0 by AI
    status: Mapped[str] = mapped_column(String(20), default="approved", nullable=False) # approved, pending, flagged
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    user: Mapped["User"] = relationship("User")

from app.models.user import User
