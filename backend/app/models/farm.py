#python file 
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, ForeignKey, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from app.models.base import Base

class Farm(Base):
    __tablename__ = "farms"
    
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
    
    images: Mapped[List["FarmImage"]] = relationship("FarmImage", back_populates="farm", cascade="all, delete-orphan")
    products: Mapped[List["Product"]] = relationship("Product", back_populates="farm", cascade="all, delete-orphan")
    bookings: Mapped[List["FarmBooking"]] = relationship("FarmBooking", back_populates="farm", cascade="all, delete-orphan")

class FarmImage(Base):
    __tablename__ = "farm_images"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    farm_id: Mapped[int] = mapped_column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    farm: Mapped["Farm"] = relationship("Farm", back_populates="images")

from app.models.marketplace import Product
from app.models.booking import FarmBooking
