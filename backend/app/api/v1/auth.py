from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserOut, Token, TokenRefreshRequest, UserUpdate
from app.services.auth_service import AuthService
from app.core import security
from pydantic import BaseModel, EmailStr

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str

class SupabaseSyncRequest(BaseModel):
    """Request body for syncing Supabase-authenticated user with local database."""
    access_token: str

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return AuthService.register(db, user_in)

@router.post("/login", response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    return AuthService.login(db, login_in.email, login_in.password)

@router.post("/refresh", response_model=Token)
def refresh(refresh_in: TokenRefreshRequest, db: Session = Depends(get_db)):
    return AuthService.refresh_token(db, refresh_in.refresh_token)

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out. Please clear your local tokens."}

@router.post("/reset-password")
def reset_password(reset_in: PasswordResetRequest, db: Session = Depends(get_db)):
    AuthService.reset_password(db, reset_in.email, reset_in.new_password)
    return {"message": "Password reset successful"}

@router.post("/supabase-sync", response_model=Token)
def supabase_sync(sync_in: SupabaseSyncRequest, db: Session = Depends(get_db)):
    """
    Sync a Supabase-authenticated user with the local database.
    Validates the Supabase JWT, finds or creates the user in SQLAlchemy DB,
    and returns local API JWT tokens.
    """
    try:
        payload = security.verify_supabase_token(sync_in.access_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Supabase token"
        )
    
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supabase token does not contain an email"
        )
    
    # Extract user metadata from Supabase token
    user_metadata = payload.get("user_metadata", {})
    full_name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]
    
    return AuthService.find_or_create_supabase_user(db, email, full_name)
