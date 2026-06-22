from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.booking import FarmBooking, HomestayBooking
from app.models.homestay import Room
from typing import Optional, List

class BookingRepository:
    # Farm bookings
    @staticmethod
    def get_farm_booking_by_id(db: Session, booking_id: int) -> Optional[FarmBooking]:
        return db.get(FarmBooking, booking_id)

    @staticmethod
    def create_farm_booking(db: Session, booking: FarmBooking) -> FarmBooking:
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def list_farm_bookings_by_user(db: Session, user_id: int) -> List[FarmBooking]:
        stmt = select(FarmBooking).where(FarmBooking.tourist_id == user_id).order_by(desc(FarmBooking.created_at))
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_farm_bookings_by_farm(db: Session, farm_id: int) -> List[FarmBooking]:
        stmt = select(FarmBooking).where(FarmBooking.farm_id == farm_id).order_by(desc(FarmBooking.created_at))
        return list(db.execute(stmt).scalars().all())

    # Homestay bookings
    @staticmethod
    def get_homestay_booking_by_id(db: Session, booking_id: int) -> Optional[HomestayBooking]:
        return db.get(HomestayBooking, booking_id)

    @staticmethod
    def create_homestay_booking(db: Session, booking: HomestayBooking) -> HomestayBooking:
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def list_homestay_bookings_by_user(db: Session, user_id: int) -> List[HomestayBooking]:
        stmt = select(HomestayBooking).where(HomestayBooking.tourist_id == user_id).order_by(desc(HomestayBooking.created_at))
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_homestay_bookings_by_homestay(db: Session, homestay_id: int) -> List[HomestayBooking]:
        stmt = select(HomestayBooking).join(Room).where(Room.homestay_id == homestay_id).order_by(desc(HomestayBooking.created_at))
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_homestay_bookings_by_room(db: Session, room_id: int) -> List[HomestayBooking]:
        stmt = select(HomestayBooking).where(HomestayBooking.room_id == room_id).order_by(desc(HomestayBooking.created_at))
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def update(db: Session) -> None:
        db.commit()
