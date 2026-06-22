from sqlalchemy import select, desc, asc
from sqlalchemy.orm import Session
from app.models.homestay import Homestay, HomestayImage, Room
from typing import Optional, List

class HomestayRepository:
    # Homestay operations
    @staticmethod
    def get_homestay_by_id(db: Session, homestay_id: int) -> Optional[Homestay]:
        return db.get(Homestay, homestay_id)

    @staticmethod
    def get_homestay_by_owner_id(db: Session, owner_id: int) -> Optional[Homestay]:
        stmt = select(Homestay).where(Homestay.owner_id == owner_id)
        return db.execute(stmt).scalars().first()

    @staticmethod
    def create_homestay(db: Session, homestay: Homestay) -> Homestay:
        db.add(homestay)
        db.commit()
        db.refresh(homestay)
        return homestay

    @staticmethod
    def update(db: Session) -> None:
        db.commit()

    @staticmethod
    def list_homestays(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = "approved",
        sort: Optional[str] = None
    ) -> List[Homestay]:
        stmt = select(Homestay)
        if status:
            stmt = stmt.where(Homestay.status == status)
        if search:
            stmt = stmt.where(Homestay.name.ilike(f"%{search}%") | Homestay.location.ilike(f"%{search}%"))
        
        if sort == "rating_desc":
            stmt = stmt.order_by(desc(Homestay.rating))
        elif sort == "name_asc":
            stmt = stmt.order_by(asc(Homestay.name))
        else:
            stmt = stmt.order_by(desc(Homestay.created_at))
            
        stmt = stmt.offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count_homestays(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = "approved"
    ) -> int:
        stmt = select(Homestay)
        if status:
            stmt = stmt.where(Homestay.status == status)
        if search:
            stmt = stmt.where(Homestay.name.ilike(f"%{search}%") | Homestay.location.ilike(f"%{search}%"))
        return len(db.execute(stmt).scalars().all())

    @staticmethod
    def add_homestay_image(db: Session, homestay_image: HomestayImage) -> HomestayImage:
        db.add(homestay_image)
        db.commit()
        db.refresh(homestay_image)
        return homestay_image

    # Room operations
    @staticmethod
    def get_room_by_id(db: Session, room_id: int) -> Optional[Room]:
        return db.get(Room, room_id)

    @staticmethod
    def create_room(db: Session, room: Room) -> Room:
        db.add(room)
        db.commit()
        db.refresh(room)
        return room

    @staticmethod
    def list_rooms(db: Session, homestay_id: int) -> List[Room]:
        stmt = select(Room).where(Room.homestay_id == homestay_id)
        return list(db.execute(stmt).scalars().all())
