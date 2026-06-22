from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from app.models.review import Review
from typing import Optional, List

class ReviewRepository:
    @staticmethod
    def get_by_id(db: Session, review_id: int) -> Optional[Review]:
        return db.get(Review, review_id)

    @staticmethod
    def create_review(db: Session, review: Review) -> Review:
        db.add(review)
        db.commit()
        db.refresh(review)
        return review

    @staticmethod
    def list_reviews_by_target(
        db: Session,
        target_type: str,
        target_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = "approved"
    ) -> List[Review]:
        stmt = select(Review).where(
            Review.target_type == target_type,
            Review.target_id == target_id
        )
        if status:
            stmt = stmt.where(Review.status == status)
        stmt = stmt.order_by(desc(Review.created_at)).offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def list_reviews(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Review]:
        stmt = select(Review)
        if status:
            stmt = stmt.where(Review.status == status)
        if search:
            stmt = stmt.where(Review.comment.ilike(f"%{search}%"))
        stmt = stmt.order_by(desc(Review.created_at)).offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count_reviews(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> int:
        stmt = select(Review)
        if status:
            stmt = stmt.where(Review.status == status)
        if search:
            stmt = stmt.where(Review.comment.ilike(f"%{search}%"))
        return len(db.execute(stmt).scalars().all())

    @staticmethod
    def update(db: Session) -> None:
        db.commit()
