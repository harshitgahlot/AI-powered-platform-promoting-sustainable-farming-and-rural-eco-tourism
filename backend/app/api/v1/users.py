from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core import security
from app.models.user import User, UserImage
from app.schemas.user import UserOut, UserUpdate, UserSuspensionUpdate
from app.services.auth_service import AuthService
from app.services.storage_service import get_storage_provider
from app.repositories.user_repository import UserRepository
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """Dependency injection to get the currently authenticated user."""
    return AuthService.get_current_user(db, token)

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency injection to enforce administrator role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation requires administrator privileges"
        )
    return current_user

@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Apply updates through repository
    for field, val in user_in.model_dump(exclude_unset=True).items():
        if field == "password":
            current_user.password_hash = security.get_password_hash(val)
        else:
            setattr(current_user, field, val)
    UserRepository.update(db)
    return current_user

@router.post("/me/upload-image", response_model=UserOut)
async def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    storage = get_storage_provider()
    content = await file.read()
    url = await storage.upload_file(content, file.filename)
    
    # Save image
    img = UserImage(user_id=current_user.id, url=url)
    UserRepository.add_image(db, img)
    return current_user

# Admin routes
@router.get("", response_model=List[UserOut])
def list_all_users(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    skip = (page - 1) * limit
    return UserRepository.list_users(db, skip=skip, limit=limit, search=search)

@router.put("/{user_id}/suspend", response_model=UserOut)
def toggle_user_suspension(
    user_id: int,
    suspension: UserSuspensionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user.is_suspended = suspension.is_suspended
    UserRepository.update(db)
    return user
