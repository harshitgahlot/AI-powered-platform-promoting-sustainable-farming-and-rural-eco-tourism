from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from app.schemas.user import UserOut

class ReviewBase(BaseModel):
    target_type: str # farm, homestay, product
    target_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewStatusUpdate(BaseModel):
    status: str # approved, pending, flagged

class ReviewOut(ReviewBase):
    id: int
    user_id: int
    sentiment_score: float
    status: str
    created_at: datetime
    user: UserOut
    
    model_config = ConfigDict(from_attributes=True)

class ReviewListResponse(BaseModel):
    items: List[ReviewOut]
    total: int
    page: int
    limit: int
    pages: int
