from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from app.schemas.farm import FarmOut
from app.schemas.homestay import RoomOut

# Farm Booking
class FarmBookingBase(BaseModel):
    farm_id: int
    visit_date: date
    number_of_guests: int = Field(..., gt=0)

class FarmBookingCreate(FarmBookingBase):
    pass

class FarmBookingStatusUpdate(BaseModel):
    status: str # pending, confirmed, cancelled, completed

class FarmBookingOut(BaseModel):
    id: int
    tourist_id: int
    farm_id: int
    visit_date: date
    number_of_guests: int
    total_price: float
    status: str
    created_at: datetime
    farm: FarmOut
    
    model_config = ConfigDict(from_attributes=True)

# Homestay Booking
class HomestayBookingBase(BaseModel):
    room_id: int
    check_in: date
    check_out: date

class HomestayBookingCreate(HomestayBookingBase):
    pass

class HomestayBookingStatusUpdate(BaseModel):
    status: str # pending, confirmed, cancelled, completed

class HomestayBookingOut(BaseModel):
    id: int
    tourist_id: int
    room_id: int
    check_in: date
    check_out: date
    total_price: float
    status: str
    created_at: datetime
    room: RoomOut
    
    model_config = ConfigDict(from_attributes=True)
