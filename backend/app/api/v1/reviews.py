from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut, ReviewListResponse, ReviewStatusUpdate
from app.repositories.review_repository import ReviewRepository
from app.services.ai_sentiment_service import AISentimentService
from app.api.v1.users import get_current_user, get_admin_user
import math
from typing import Optional

router = APIRouter()

@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Perform AI sentiment analysis on the comment
    score, _ = AISentimentService.analyze_sentiment(review_in.comment)
    
    review = Review(
        user_id=current_user.id,
        target_type=review_in.target_type,
        target_id=review_in.target_id,
        rating=review_in.rating,
        comment=review_in.comment,
        sentiment_score=score,
        status="approved" # Auto approved initially
    )
    return ReviewRepository.create_review(db, review)

@router.get("", response_model=ReviewListResponse)
def list_reviews(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = "approved",
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    items = ReviewRepository.list_reviews(db, skip=skip, limit=limit, search=search, status=status)
    total = ReviewRepository.count_reviews(db, search=search, status=status)
    pages = math.ceil(total / limit) if total > 0 else 1
    
    return ReviewListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@router.get("/target/{target_type}/{target_id}", response_model=ReviewListResponse)
def list_target_reviews(
    target_type: str,
    target_id: int,
    page: int = 1,
    limit: int = 20,
    status: str = "approved",
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    items = ReviewRepository.list_reviews_by_target(
        db, target_type=target_type, target_id=target_id, skip=skip, limit=limit, status=status
    )
    total = len(items) # Simple count for demo
    pages = 1
    return ReviewListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

# Admin Moderate
@router.put("/{review_id}/moderate", response_model=ReviewOut)
def moderate_review(
    review_id: int,
    status_update: ReviewStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    review = ReviewRepository.get_by_id(db, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    review.status = status_update.status
    ReviewRepository.update(db)
    return review
