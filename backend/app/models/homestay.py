from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, ForeignKey, Integer, Float, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from app.models.base import Base

class Homestay(Base):
    __tablename__ = "homestays"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric(10, 8), nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric(11, 8), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending_approval", nullable=False) # pending_approval, approved, rejected
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    images: Mapped[List["HomestayImage"]] = relationship("HomestayImage", back_populates="homestay", cascade="all, delete-orphan")
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="homestay", cascade="all, delete-orphan")

class HomestayImage(Base):
    __tablename__ = "homestay_images"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    homestay_id: Mapped[int] = mapped_column(Integer, ForeignKey("homestays.id", ondelete="CASCADE"), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    homestay: Mapped["Homestay"] = relationship("Homestay", back_populates="images")

class Room(Base):
    __tablename__ = "rooms"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    homestay_id: Mapped[int] = mapped_column(Integer, ForeignKey("homestays.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    price_per_night: Mapped[float] = mapped_column(Float, nullable=False)
    occupancy: Mapped[int] = mapped_column(Integer, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    homestay: Mapped["Homestay"] = relationship("Homestay", back_populates="rooms")
    bookings: Mapped[List["HomestayBooking"]] = relationship("HomestayBooking", back_populates="room", cascade="all, delete-orphan")

from app.models.booking import HomestayBooking
