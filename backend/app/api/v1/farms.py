from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmUpdate, FarmOut, FarmListResponse, FarmStatusUpdate, FarmImageOut
from app.services.farm_service import FarmService
from app.api.v1.users import get_current_user, get_admin_user
from typing import Optional

router = APIRouter()

def get_farmer_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["farmer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation requires Farmer role permissions"
        )
    return current_user

@router.post("", response_model=FarmOut, status_code=status.HTTP_201_CREATED)
def create_farm_profile(
    farm_in: FarmCreate,
    db: Session = Depends(get_db),
    farmer: User = Depends(get_farmer_user)
):
    return FarmService.create_farm(db, farmer.id, farm_in)

@router.get("", response_model=FarmListResponse)
def list_farms(
    page: int = 1,
    limit: int = 20,
    search: str = "",
    status: str = "approved",
    sort: str = "",
    db: Session = Depends(get_db)
):
    return FarmService.list_farms(db, page=page, limit=limit, search=search, status=status, sort=sort)

@router.get("/my-profile", response_model=FarmOut)
def get_my_farm_profile(
    db: Session = Depends(get_db),
    farmer: User = Depends(get_farmer_user)
):
    return FarmService.get_farm_by_owner(db, farmer.id)

@router.get("/{farm_id}", response_model=FarmOut)
def get_farm_details(farm_id: int, db: Session = Depends(get_db)):
    return FarmService.get_farm(db, farm_id)

@router.put("/{farm_id}", response_model=FarmOut)
def update_farm_profile(
    farm_id: int,
    farm_in: FarmUpdate,
    db: Session = Depends(get_db),
    farmer: User = Depends(get_farmer_user)
):
    return FarmService.update_farm(db, farmer.id, farm_id, farm_in)

@router.post("/{farm_id}/upload-image", response_model=FarmImageOut)
async def upload_farm_image(
    farm_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    farmer: User = Depends(get_farmer_user)
):
    farm = FarmService.get_farm(db, farm_id)
    if farm.owner_id != farmer.id and farmer.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add images to this farm"
        )
        
    content = await file.read()
    return await FarmService.upload_image(db, farm_id, content, file.filename)

# Admin route
@router.put("/{farm_id}/approve", response_model=FarmOut)
def approve_farm_profile(
    farm_id: int,
    status_update: FarmStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    return FarmService.approve_farm(db, farm_id, status_update.status)
