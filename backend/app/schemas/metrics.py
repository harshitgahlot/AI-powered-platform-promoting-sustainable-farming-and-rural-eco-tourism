from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from typing import List

class DailyMetricOut(BaseModel):
    id: int
    date: date
    total_revenue: float
    bookings_count: int
    orders_count: int
    active_users: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class MonthlyMetricOut(BaseModel):
    id: int
    year: int
    month: int
    total_revenue: float
    bookings_count: int
    orders_count: int
    active_users: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PlatformAnalyticsOut(BaseModel):
    total_users: int
    total_farmers: int
    total_homestay_owners: int
    total_revenue: float
    total_bookings: int
    total_orders: int
    daily_history: List[DailyMetricOut]
    monthly_history: List[MonthlyMetricOut]
