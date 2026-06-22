from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.farm import Farm, FarmImage
from app.repositories.farm_repository import FarmRepository
from app.schemas.farm import FarmCreate, FarmUpdate, FarmListResponse
from app.services.storage_service import get_storage_provider
import math

class FarmService:
    @staticmethod
    def create_farm(db: Session, owner_id: int, farm_in: FarmCreate) -> Farm:
        # Check if owner already has a farm
        existing = FarmRepository.get_by_owner_id(db, owner_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owner already has a farm profile registered"
            )
        
        farm = Farm(
            owner_id=owner_id,
            name=farm_in.name,
            description=farm_in.description,
            location=farm_in.location,
            latitude=farm_in.latitude,
            longitude=farm_in.longitude,
            status="pending_approval"
        )
        return FarmRepository.create(db, farm)

    @staticmethod
    def get_farm(db: Session, farm_id: int) -> Farm:
        farm = FarmRepository.get_by_id(db, farm_id)
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm profile not found"
            )
        return farm

    @staticmethod
    def get_farm_by_owner(db: Session, owner_id: int) -> Farm:
        farm = FarmRepository.get_by_owner_id(db, owner_id)
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm profile not found for this user"
            )
        return farm

    @staticmethod
    def update_farm(db: Session, owner_id: int, farm_id: int, farm_in: FarmUpdate) -> Farm:
        farm = FarmService.get_farm(db, farm_id)
        if farm.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to edit this farm profile"
            )
            
        for field, val in farm_in.model_dump(exclude_unset=True).items():
            setattr(farm, field, val)
            
        FarmRepository.update(db)
        return farm

    @staticmethod
    def approve_farm(db: Session, farm_id: int, approve_status: str) -> Farm:
        farm = FarmService.get_farm(db, farm_id)
        if approve_status not in ["approved", "rejected", "pending_approval"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid farm approval status"
            )
        farm.status = approve_status
        FarmRepository.update(db)
        return farm

    @staticmethod
    def list_farms(
        db: Session,
        page: int = 1,
        limit: int = 20,
        search: str = "",
        status: str = "approved",
        sort: str = ""
    ) -> FarmListResponse:
        skip = (page - 1) * limit
        items = FarmRepository.list_farms(db, skip=skip, limit=limit, search=search, status=status, sort=sort)
        total = FarmRepository.count_farms(db, search=search, status=status)
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return FarmListResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )

    @staticmethod
    async def upload_image(db: Session, farm_id: int, file_content: bytes, filename: str) -> FarmImage:
        farm = FarmService.get_farm(db, farm_id)
        storage = get_storage_provider()
        url = await storage.upload_file(file_content, filename)
        
        farm_image = FarmImage(farm_id=farm.id, url=url)
        return FarmRepository.add_image(db, farm_image)
