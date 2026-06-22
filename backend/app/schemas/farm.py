from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

class FarmImageBase(BaseModel):
    url: str

class FarmImageCreate(FarmImageBase):
    pass

class FarmImageOut(FarmImageBase):
    id: int
    farm_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class FarmBase(BaseModel):
    name: str
    description: str
    location: str
    latitude: Decimal = Field(..., max_digits=10, decimal_places=8)
    longitude: Decimal = Field(..., max_digits=11, decimal_places=8)

class FarmCreate(FarmBase):
    pass

class FarmUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

class FarmStatusUpdate(BaseModel):
    status: str # pending_approval, approved, rejected

class FarmOut(FarmBase):
    id: int
    owner_id: int
    status: str
    rating: float
    created_at: datetime
    images: List[FarmImageOut] = []
    
    model_config = ConfigDict(from_attributes=True)

class FarmListResponse(BaseModel):
    items: List[FarmOut]
    total: int
    page: int
    limit: int
    pages: int
