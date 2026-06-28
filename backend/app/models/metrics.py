#python file
from datetime import date, datetime
from sqlalchemy import DateTime, Date, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class DailyMetric(Base):
    __tablename__ = "daily_metrics"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, unique=True, index=True, nullable=False)
    total_revenue: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    bookings_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    orders_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_users: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

class MonthlyMetric(Base):
    __tablename__ = "monthly_metrics"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    total_revenue: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    bookings_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    orders_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_users: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
