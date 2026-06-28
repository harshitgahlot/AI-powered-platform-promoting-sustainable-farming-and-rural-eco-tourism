#python file
from datetime import date, datetime
from sqlalchemy import String, ForeignKey, Integer, Float, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class FarmBooking(Base):
    __tablename__ = "farm_bookings"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tourist_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id: Mapped[int] = mapped_column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    visit_date: Mapped[date] = mapped_column(Date, nullable=False)
    number_of_guests: Mapped[int] = mapped_column(Integer, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False) # pending, confirmed, cancelled, completed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    tourist: Mapped["User"] = relationship("User")
    farm: Mapped["Farm"] = relationship("Farm", back_populates="bookings")

class HomestayBooking(Base):
    __tablename__ = "homestay_bookings"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tourist_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_id: Mapped[int] = mapped_column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False) # pending, confirmed, cancelled, completed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    tourist: Mapped["User"] = relationship("User")
    room: Mapped["Room"] = relationship("Room", back_populates="bookings")

from app.models.user import User
from app.models.farm import Farm
from app.models.homestay import Room
