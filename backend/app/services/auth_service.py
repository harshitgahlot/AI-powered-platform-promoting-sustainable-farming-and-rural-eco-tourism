from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.marketplace import Cart
from app.repositories.user_repository import UserRepository
from app.repositories.marketplace_repository import MarketplaceRepository
from app.schemas.user import UserCreate, Token
from app.core import security
from typing import Optional

class AuthService:
    @staticmethod
    def register(db: Session, user_create: UserCreate) -> User:
        # Check if user exists
        existing_user = UserRepository.get_by_email(db, user_create.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        hashed_password = security.get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            full_name=user_create.full_name,
            password_hash=hashed_password,
            role=user_create.role
        )
        UserRepository.create(db, db_user)
        
        # Create cart associated with the user
        MarketplaceRepository.get_cart_by_user_id(db, db_user.id)
        
        return db_user

    @staticmethod
    def login(db: Session, email: str, password: str) -> Token:
        user = UserRepository.get_by_email(db, email)
        if not user or not security.verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if user.is_suspended:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended"
            )
            
        access_token = security.create_access_token(subject=user.id)
        refresh_token = security.create_refresh_token(subject=user.id)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            role=user.role
        )

    @staticmethod
    def refresh_token(db: Session, refresh_token_str: str) -> Token:
        payload = security.decode_token(refresh_token_str)
        if not payload or payload.get("token_type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
            
        user_id = int(payload.get("sub"))
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        if user.is_suspended:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended"
            )
            
        access_token = security.create_access_token(subject=user.id)
        new_refresh_token = security.create_refresh_token(subject=user.id)
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            role=user.role
        )

    @staticmethod
    def reset_password(db: Session, email: str, password: str) -> None:
        user = UserRepository.get_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found with this email"
            )
        user.password_hash = security.get_password_hash(password)
        UserRepository.update(db)

    @staticmethod
    def get_current_user(db: Session, token: str) -> User:
        payload = security.decode_token(token)
        if not payload or payload.get("token_type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
            
        user_id = int(payload.get("sub"))
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        if user.is_suspended:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account suspended"
            )
            
        return user
