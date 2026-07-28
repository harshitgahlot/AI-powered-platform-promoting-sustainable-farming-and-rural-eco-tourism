from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.ai import (
    ChatQuery, ChatResponse, ForecastRequest, ForecastResponse, SentimentResponse,
    ChatSessionOut, ChatSessionCreate, ChatMessageOut
)
from app.schemas.farm import FarmOut
from app.schemas.homestay import HomestayOut
from app.services.ai_chatbot_service import AIChatbotService
from app.services.gemini_service import GeminiService
from app.services.ai_recommend_service import AIRecommendService
from app.services.ai_sentiment_service import AISentimentService
from app.services.ai_forecast_service import AIForecastService
from app.api.v1.users import get_current_user, get_admin_user
from typing import List, Optional

router = APIRouter()

@router.post("/chatbot", response_model=ChatResponse)
def run_chatbot(
    query: ChatQuery,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Public/Authenticated Gemini Chat endpoint.
    Attempts Gemini API execution; if GEMINI_API_KEY is not configured or throws an error,
    it falls back to the local AIChatbotService so the application remains usable while testing.
    """
    try:
        reply_text, suggestions = GeminiService.generate_chat_response(query.message, query.history)
    except Exception as e:
        # Fallback to local TF-IDF chatbot if Gemini key unconfigured
        local_res = AIChatbotService.get_chat_response(query.message, query.history)
        reply_text = local_res.reply
        suggestions = local_res.suggestions

    # If session_id is provided and user is authenticated, persist messages
    session_id = query.session_id
    if current_user and session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
        if session:
            user_msg = ChatMessage(session_id=session.id, sender="user", content=query.message)
            ai_msg = ChatMessage(session_id=session.id, sender="assistant", content=reply_text, suggestions={"items": suggestions})
            db.add(user_msg)
            db.add(ai_msg)
            db.commit()

    return ChatResponse(reply=reply_text, suggestions=suggestions, session_id=session_id)


# Chat Sessions Endpoints (Authenticated)
@router.get("/sessions", response_model=List[ChatSessionOut])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all chat sessions for current user."""
    return db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.updated_at.desc()).all()


@router.post("/sessions", response_model=ChatSessionOut, status_code=status.HTTP_201_CREATED)
def create_chat_session(
    session_in: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new chat session."""
    session = ChatSession(
        user_id=current_user.id,
        title=session_in.title or "New Conversation"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/{session_id}", response_model=ChatSessionOut)
def get_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific chat session with full message history."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    return session


@router.delete("/sessions/{session_id}")
def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a chat session."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    db.delete(session)
    db.commit()
    return {"message": "Chat session deleted successfully"}


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
