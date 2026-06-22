from datetime import date
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.metrics import DailyMetric, MonthlyMetric
from typing import List, Optional

class MetricsRepository:
    @staticmethod
    def get_daily_metric_by_date(db: Session, metric_date: date) -> Optional[DailyMetric]:
        stmt = select(DailyMetric).where(DailyMetric.date == metric_date)
        return db.execute(stmt).scalars().first()

    @staticmethod
    def get_all_daily_metrics(db: Session, limit: int = 30) -> List[DailyMetric]:
        stmt = select(DailyMetric).order_by(desc(DailyMetric.date)).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def create_daily_metric(db: Session, metric: DailyMetric) -> DailyMetric:
        db.add(metric)
        db.commit()
        db.refresh(metric)
        return metric

    @staticmethod
    def get_monthly_metric(db: Session, year: int, month: int) -> Optional[MonthlyMetric]:
        stmt = select(MonthlyMetric).where(MonthlyMetric.year == year, MonthlyMetric.month == month)
        return db.execute(stmt).scalars().first()

    @staticmethod
    def get_all_monthly_metrics(db: Session) -> List[MonthlyMetric]:
        stmt = select(MonthlyMetric).order_by(desc(MonthlyMetric.year), desc(MonthlyMetric.month))
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def create_monthly_metric(db: Session, metric: MonthlyMetric) -> MonthlyMetric:
        db.add(metric)
        db.commit()
        db.refresh(metric)
        return metric

    @staticmethod
    def update(db: Session) -> None:
        db.commit()
