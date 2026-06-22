from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.booking import FarmBooking, HomestayBooking
from app.models.homestay import Room
from app.models.farm import Farm
from app.repositories.booking_repository import BookingRepository
from app.repositories.homestay_repository import HomestayRepository
from app.repositories.farm_repository import FarmRepository
from app.schemas.booking import FarmBookingCreate, HomestayBookingCreate
from typing import List
import datetime

class BookingService:
    # Farm bookings
    @staticmethod
    def create_farm_booking(db: Session, tourist_id: int, booking_in: FarmBookingCreate) -> FarmBooking:
        farm = FarmRepository.get_by_id(db, booking_in.farm_id)
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm profile not found"
            )
            
        if farm.status != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This farm is not accepting bookings yet"
            )
            
        # Farm visits cost calculation (e.g., flat charge of $15 / guest for tour)
        price_per_guest = 15.0
        total_price = price_per_guest * booking_in.number_of_guests
        
        booking = FarmBooking(
            tourist_id=tourist_id,
            farm_id=booking_in.farm_id,
            visit_date=booking_in.visit_date,
            number_of_guests=booking_in.number_of_guests,
            total_price=total_price,
            status="pending"
        )
        return BookingRepository.create_farm_booking(db, booking)

    @staticmethod
    def get_farm_booking(db: Session, booking_id: int, user_id: int, role: str) -> FarmBooking:
        booking = BookingRepository.get_farm_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm booking not found"
            )
            
        if role != "admin" and booking.tourist_id != user_id and booking.farm.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this booking"
            )
        return booking

    @staticmethod
    def update_farm_booking_status(db: Session, booking_id: int, status_update: str, user_id: int, role: str) -> FarmBooking:
        booking = BookingService.get_farm_booking(db, booking_id, user_id, role)
        
        # Validation on who can change status
        if role == "tourist" and status_update != "cancelled":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tourists can only cancel bookings"
            )
            
        booking.status = status_update
        BookingRepository.update(db)
        return booking

    # Homestay bookings
    @staticmethod
    def create_homestay_booking(db: Session, tourist_id: int, booking_in: HomestayBookingCreate) -> HomestayBooking:
        room = HomestayRepository.get_room_by_id(db, booking_in.room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room listing not found"
            )
            
        if not room.is_available or room.homestay.status != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This room is not available for bookings"
            )
            
        if booking_in.check_out <= booking_in.check_in:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Check-out date must be after check-in date"
            )
            
        # Check overlapping homestay bookings
        stmt = select(HomestayBooking).where(
            HomestayBooking.room_id == room.id,
            HomestayBooking.status != "cancelled",
            HomestayBooking.check_in < booking_in.check_out,
            HomestayBooking.check_out > booking_in.check_in
        )
        overlaps = db.execute(stmt).scalars().all()
        if overlaps:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This room is already booked for the selected dates"
            )
            
        # Price calculation
        delta = booking_in.check_out - booking_in.check_in
        days = delta.days
        total_price = room.price_per_night * days
        
        booking = HomestayBooking(
            tourist_id=tourist_id,
            room_id=room.id,
            check_in=booking_in.check_in,
            check_out=booking_in.check_out,
            total_price=total_price,
            status="pending"
        )
        return BookingRepository.create_homestay_booking(db, booking)

    @staticmethod
    def get_homestay_booking(db: Session, booking_id: int, user_id: int, role: str) -> HomestayBooking:
        booking = BookingRepository.get_homestay_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Homestay booking not found"
            )
            
        if role != "admin" and booking.tourist_id != user_id and booking.room.homestay.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this booking"
            )
        return booking

    @staticmethod
    def update_homestay_booking_status(db: Session, booking_id: int, status_update: str, user_id: int, role: str) -> HomestayBooking:
        booking = BookingService.get_homestay_booking(db, booking_id, user_id, role)
        
        if role == "tourist" and status_update != "cancelled":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tourists can only cancel bookings"
            )
            
        booking.status = status_update
        BookingRepository.update(db)
        return booking

    @staticmethod
    def list_bookings(db: Session, user_id: int, role: str) -> dict:
        """
        Returns a combined dictionary of farm and homestay bookings for the user.
        """
        if role == "tourist":
            farms = BookingRepository.list_farm_bookings_by_user(db, user_id)
            homestays = BookingRepository.list_homestay_bookings_by_user(db, user_id)
        elif role == "farmer":
            farm = FarmRepository.get_by_owner_id(db, user_id)
            farms = BookingRepository.list_farm_bookings_by_farm(db, farm.id) if farm else []
            homestays = []
        elif role == "homestay_owner":
            homestay = HomestayRepository.get_homestay_by_owner_id(db, user_id)
            farms = []
            homestays = BookingRepository.list_homestay_bookings_by_homestay(db, homestay.id) if homestay else []
        else: # admin
            stmt_f = select(FarmBooking).order_by(desc(FarmBooking.created_at))
            farms = list(db.execute(stmt_f).scalars().all())
            stmt_h = select(HomestayBooking).order_by(desc(HomestayBooking.created_at))
            homestays = list(db.execute(stmt_h).scalars().all())
            
        return {"farm_bookings": farms, "homestay_bookings": homestays}
