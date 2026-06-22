from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.homestay import (
    HomestayCreate, HomestayUpdate, HomestayOut, HomestayListResponse,
    HomestayStatusUpdate, HomestayImageOut, RoomCreate, RoomOut, RoomUpdate
)
from app.services.homestay_service import HomestayService
from app.api.v1.users import get_current_user, get_admin_user
from typing import List, Optional

router = APIRouter()

def get_homestay_owner_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["homestay_owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation requires Homestay Owner role permissions"
        )
    return current_user

@router.post("", response_model=HomestayOut, status_code=status.HTTP_201_CREATED)
def create_homestay_profile(
    homestay_in: HomestayCreate,
    db: Session = Depends(get_db),
    owner: User = Depends(get_homestay_owner_user)
):
    return HomestayService.create_homestay(db, owner.id, homestay_in)

@router.get("", response_model=HomestayListResponse)
def list_homestays(
    page: int = 1,
    limit: int = 20,
    search: str = "",
    status: str = "approved",
    sort: str = "",
    db: Session = Depends(get_db)
):
    return HomestayService.list_homestays(db, page=page, limit=limit, search=search, status=status, sort=sort)

@router.get("/my-profile", response_model=HomestayOut)
def get_my_homestay_profile(
    db: Session = Depends(get_db),
    owner: User = Depends(get_homestay_owner_user)
):
    return HomestayService.get_homestay_by_owner(db, owner.id)

@router.get("/{homestay_id}", response_model=HomestayOut)
def get_homestay_details(homestay_id: int, db: Session = Depends(get_db)):
    return HomestayService.get_homestay(db, homestay_id)

@router.put("/{homestay_id}", response_model=HomestayOut)
def update_homestay_profile(
    homestay_id: int,
    homestay_in: HomestayUpdate,
    db: Session = Depends(get_db),
    owner: User = Depends(get_homestay_owner_user)
):
    return HomestayService.update_homestay(db, owner.id, homestay_id, homestay_in)

@router.post("/{homestay_id}/upload-image", response_model=HomestayImageOut)
async def upload_homestay_image(
    homestay_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    owner: User = Depends(get_homestay_owner_user)
):
    homestay = HomestayService.get_homestay(db, homestay_id)
    if homestay.owner_id != owner.id and owner.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add images to this homestay"
        )
    content = await file.read()
    return await HomestayService.upload_image(db, homestay_id, content, file.filename)

# Room sub-routes
@router.post("/{homestay_id}/rooms", response_model=RoomOut)
def add_room_to_homestay(
    homestay_id: int,
    room_in: RoomCreate,
    db: Session = Depends(get_db),
    owner: User = Depends(get_homestay_owner_user)
):
    return HomestayService.create_room(db, owner.id, homestay_id, room_in)

@router.get("/{homestay_id}/rooms", response_model=List[RoomOut])
def list_homestay_rooms(homestay_id: int, db: Session = Depends(get_db)):
    return HomestayService.list_rooms(db, homestay_id)

@router.put("/rooms/{room_id}", response_model=RoomOut)
def update_homestay_room(
    room_id: int,
    room_in: RoomUpdate,
    db: Session = Depends(get_db),
    owner: User = Depends(get_homestay_owner_user)
):
    return HomestayService.update_room(db, owner.id, room_id, room_in)

# Admin route
@router.put("/{homestay_id}/approve", response_model=HomestayOut)
def approve_homestay_profile(
    homestay_id: int,
    status_update: HomestayStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    return HomestayService.approve_homestay(db, homestay_id, status_update.status)
