from sqlalchemy import select, desc, asc
from sqlalchemy.orm import Session
from app.models.farm import Farm, FarmImage
from typing import Optional, List

class FarmRepository:
    @staticmethod
    def get_by_id(db: Session, farm_id: int) -> Optional[Farm]:
        return db.get(Farm, farm_id)

    @staticmethod
    def get_by_owner_id(db: Session, owner_id: int) -> Optional[Farm]:
        stmt = select(Farm).where(Farm.owner_id == owner_id)
        return db.execute(stmt).scalars().first()

    @staticmethod
    def create(db: Session, farm: Farm) -> Farm:
        db.add(farm)
        db.commit()
        db.refresh(farm)
        return farm

    @staticmethod
    def update(db: Session) -> None:
        db.commit()

    @staticmethod
    def list_farms(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = "approved",
        sort: Optional[str] = None
    ) -> List[Farm]:
        stmt = select(Farm)
        if status:
            stmt = stmt.where(Farm.status == status)
        if search:
            stmt = stmt.where(Farm.name.ilike(f"%{search}%") | Farm.location.ilike(f"%{search}%"))
        
        # Sort handling
        if sort == "rating_desc":
            stmt = stmt.order_by(desc(Farm.rating))
        elif sort == "name_asc":
            stmt = stmt.order_by(asc(Farm.name))
        else:
            stmt = stmt.order_by(desc(Farm.created_at))
            
        stmt = stmt.offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count_farms(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = "approved"
    ) -> int:
        stmt = select(Farm)
        if status:
            stmt = stmt.where(Farm.status == status)
        if search:
            stmt = stmt.where(Farm.name.ilike(f"%{search}%") | Farm.location.ilike(f"%{search}%"))
        return len(db.execute(stmt).scalars().all())

    @staticmethod
    def add_image(db: Session, farm_image: FarmImage) -> FarmImage:
        db.add(farm_image)
        db.commit()
        db.refresh(farm_image)
        return farm_image
