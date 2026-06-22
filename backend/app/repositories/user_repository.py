from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import User, UserImage
from typing import Optional, List

class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.get(User, user_id)
        
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return db.execute(stmt).scalars().first()
        
    @staticmethod
    def create(db: Session, user: User) -> User:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
        
    @staticmethod
    def update(db: Session) -> None:
        db.commit()

    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None) -> List[User]:
        stmt = select(User)
        if search:
            stmt = stmt.where(User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
        stmt = stmt.offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count_users(db: Session, search: Optional[str] = None) -> int:
        stmt = select(User)
        if search:
            stmt = stmt.where(User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
        # Using a simple query length for SQLite/PG compatibility
        return len(db.execute(stmt).scalars().all())

    @staticmethod
    def add_image(db: Session, user_image: UserImage) -> UserImage:
        db.add(user_image)
        db.commit()
        db.refresh(user_image)
        return user_image
