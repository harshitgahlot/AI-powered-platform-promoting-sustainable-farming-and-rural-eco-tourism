from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserOut, Token, TokenRefreshRequest, UserUpdate
from app.services.auth_service import AuthService
from pydantic import BaseModel, EmailStr

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str

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
