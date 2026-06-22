from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

class HomestayImageBase(BaseModel):
    url: str

class HomestayImageOut(HomestayImageBase):
    id: int
    homestay_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class RoomBase(BaseModel):
    name: str
    description: str
    price_per_night: float = Field(..., gt=0)
    occupancy: int = Field(..., gt=0)
    is_available: bool = True

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_night: Optional[float] = None
    occupancy: Optional[int] = None
    is_available: Optional[bool] = None

class RoomOut(RoomBase):
    id: int
    homestay_id: int
    
    model_config = ConfigDict(from_attributes=True)

class HomestayBase(BaseModel):
    name: str
    description: str
    location: str
    latitude: Decimal = Field(..., max_digits=10, decimal_places=8)
    longitude: Decimal = Field(..., max_digits=11, decimal_places=8)

class HomestayCreate(HomestayBase):
    pass

class HomestayUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

class HomestayStatusUpdate(BaseModel):
    status: str # pending_approval, approved, rejected

class HomestayOut(HomestayBase):
    id: int
    owner_id: int
    status: str
    rating: float
    created_at: datetime
    images: List[HomestayImageOut] = []
    rooms: List[RoomOut] = []
    
    model_config = ConfigDict(from_attributes=True)

class HomestayListResponse(BaseModel):
    items: List[HomestayOut]
    total: int
    page: int
    limit: int
    pages: int
