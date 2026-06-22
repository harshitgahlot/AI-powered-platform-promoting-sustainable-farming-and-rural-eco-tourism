from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.ai import ChatQuery, ChatResponse, ForecastRequest, ForecastResponse, SentimentResponse
from app.schemas.farm import FarmOut
from app.schemas.homestay import HomestayOut
from app.services.ai_chatbot_service import AIChatbotService
from app.services.ai_recommend_service import AIRecommendService
from app.services.ai_sentiment_service import AISentimentService
from app.services.ai_forecast_service import AIForecastService
from app.api.v1.users import get_current_user, get_admin_user
from typing import List

router = APIRouter()

@router.post("/chatbot", response_model=ChatResponse)
def run_chatbot(query: ChatQuery):
    return AIChatbotService.get_chat_response(query.message, query.history)

@router.get("/recommendations/farms", response_model=List[FarmOut])
def get_farm_recommendations(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AIRecommendService.get_farm_recommendations(db, current_user.id, limit)

@router.get("/recommendations/homestays", response_model=List[HomestayOut])
def get_homestay_recommendations(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AIRecommendService.get_homestay_recommendations(db, current_user.id, limit)

@router.post("/sentiment", response_model=SentimentResponse)
def analyze_review_sentiment(review_text: str):
    score, label = AISentimentService.analyze_sentiment(review_text)
    return SentimentResponse(
        text=review_text,
        sentiment_score=score,
        sentiment_label=label
    )

@router.post("/forecast", response_model=ForecastResponse)
def forecast_demand(
    forecast_in: ForecastRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    return AIForecastService.forecast_demand(db, forecast_in.metric_type, forecast_in.days)
