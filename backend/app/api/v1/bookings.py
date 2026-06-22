from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.booking import (
    FarmBookingCreate, FarmBookingOut, FarmBookingStatusUpdate,
    HomestayBookingCreate, HomestayBookingOut, HomestayBookingStatusUpdate
)
from app.services.booking_service import BookingService
from app.api.v1.users import get_current_user
from typing import List, Dict, Any

router = APIRouter()

@router.post("/farms", response_model=FarmBookingOut, status_code=status.HTTP_201_CREATED)
def create_farm_visit_booking(
    booking_in: FarmBookingCreate,
    db: Session = Depends(get_db),
    tourist: User = Depends(get_current_user)
):
    return BookingService.create_farm_booking(db, tourist.id, booking_in)

@router.post("/homestays", response_model=HomestayBookingOut, status_code=status.HTTP_201_CREATED)
def create_homestay_room_booking(
    booking_in: HomestayBookingCreate,
    db: Session = Depends(get_db),
    tourist: User = Depends(get_current_user)
):
    return BookingService.create_homestay_booking(db, tourist.id, booking_in)

@router.get("")
def list_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.list_bookings(db, current_user.id, current_user.role)

@router.put("/farms/{booking_id}/status", response_model=FarmBookingOut)
def update_farm_booking_status(
    booking_id: int,
    status_update: FarmBookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.update_farm_booking_status(
        db, booking_id, status_update.status, current_user.id, current_user.role
    )

@router.put("/homestays/{booking_id}/status", response_model=HomestayBookingOut)
def update_homestay_booking_status(
    booking_id: int,
    status_update: HomestayBookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.update_homestay_booking_status(
        db, booking_id, status_update.status, current_user.id, current_user.role
    )
