from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.metrics import PlatformAnalyticsOut
from app.services.analytics_service import AnalyticsService
from app.api.v1.users import get_current_user
from typing import Dict, Any

router = APIRouter()

@router.get("", response_model=PlatformAnalyticsOut)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only allow Admin, Farmer, or Homestay Owners to check analytical metrics.
    # Tourists don't see system analytics, only their own bookings.
    if current_user.role not in ["admin", "farmer", "homestay_owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Analytics dashboard requires administrative or business owner roles"
        )
    return AnalyticsService.get_platform_analytics(db)
