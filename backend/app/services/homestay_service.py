from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.homestay import Homestay, HomestayImage, Room
from app.repositories.homestay_repository import HomestayRepository
from app.schemas.homestay import HomestayCreate, HomestayUpdate, HomestayListResponse, RoomCreate, RoomUpdate
from app.services.storage_service import get_storage_provider
import math
from typing import List

class HomestayService:
    @staticmethod
    def create_homestay(db: Session, owner_id: int, homestay_in: HomestayCreate) -> Homestay:
        existing = HomestayRepository.get_homestay_by_owner_id(db, owner_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owner already has a homestay listing registered"
            )
            
        homestay = Homestay(
            owner_id=owner_id,
            name=homestay_in.name,
            description=homestay_in.description,
            location=homestay_in.location,
            latitude=homestay_in.latitude,
            longitude=homestay_in.longitude,
            status="pending_approval"
        )
        return HomestayRepository.create_homestay(db, homestay)

    @staticmethod
    def get_homestay(db: Session, homestay_id: int) -> Homestay:
        homestay = HomestayRepository.get_homestay_by_id(db, homestay_id)
        if not homestay:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Homestay listing not found"
            )
        return homestay

    @staticmethod
    def get_homestay_by_owner(db: Session, owner_id: int) -> Homestay:
        homestay = HomestayRepository.get_homestay_by_owner_id(db, owner_id)
        if not homestay:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Homestay listing not found for this user"
            )
        return homestay

    @staticmethod
    def update_homestay(db: Session, owner_id: int, homestay_id: int, homestay_in: HomestayUpdate) -> Homestay:
        homestay = HomestayService.get_homestay(db, homestay_id)
        if homestay.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to edit this homestay"
            )
            
        for field, val in homestay_in.model_dump(exclude_unset=True).items():
            setattr(homestay, field, val)
            
        HomestayRepository.update(db)
        return homestay

    @staticmethod
    def approve_homestay(db: Session, homestay_id: int, approve_status: str) -> Homestay:
        homestay = HomestayService.get_homestay(db, homestay_id)
        if approve_status not in ["approved", "rejected", "pending_approval"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid homestay approval status"
            )
        homestay.status = approve_status
        HomestayRepository.update(db)
        return homestay

    @staticmethod
    def list_homestays(
        db: Session,
        page: int = 1,
        limit: int = 20,
        search: str = "",
        status: str = "approved",
        sort: str = ""
    ) -> HomestayListResponse:
        skip = (page - 1) * limit
        items = HomestayRepository.list_homestays(db, skip=skip, limit=limit, search=search, status=status, sort=sort)
        total = HomestayRepository.count_homestays(db, search=search, status=status)
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return HomestayListResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )

    @staticmethod
    async def upload_image(db: Session, homestay_id: int, file_content: bytes, filename: str) -> HomestayImage:
        homestay = HomestayService.get_homestay(db, homestay_id)
        storage = get_storage_provider()
        url = await storage.upload_file(file_content, filename)
        
        homestay_image = HomestayImage(homestay_id=homestay.id, url=url)
        return HomestayRepository.add_homestay_image(db, homestay_image)

    # Room operations
    @staticmethod
    def create_room(db: Session, owner_id: int, homestay_id: int, room_in: RoomCreate) -> Room:
        homestay = HomestayService.get_homestay(db, homestay_id)
        if homestay.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to add rooms to this homestay"
            )
            
        room = Room(
            homestay_id=homestay.id,
            name=room_in.name,
            description=room_in.description,
            price_per_night=room_in.price_per_night,
            occupancy=room_in.occupancy,
            is_available=room_in.is_available
        )
        return HomestayRepository.create_room(db, room)

    @staticmethod
    def get_room(db: Session, room_id: int) -> Room:
        room = HomestayRepository.get_room_by_id(db, room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
        return room

    @staticmethod
    def list_rooms(db: Session, homestay_id: int) -> List[Room]:
        return HomestayRepository.list_rooms(db, homestay_id)

    @staticmethod
    def update_room(db: Session, owner_id: int, room_id: int, room_in: RoomUpdate) -> Room:
        room = HomestayService.get_room(db, room_id)
        if room.homestay.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to edit this room"
            )
            
        for field, val in room_in.model_dump(exclude_unset=True).items():
            setattr(room, field, val)
            
        HomestayRepository.update(db)
        return room
