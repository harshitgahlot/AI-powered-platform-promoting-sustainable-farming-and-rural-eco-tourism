from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class ChatQuery(BaseModel):
    message: str
    session_id: Optional[int] = None
    history: Optional[List[Dict[str, Any]]] = []

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []
    session_id: Optional[int] = None

class ChatMessageCreate(BaseModel):
    sender: str # 'user' or 'assistant'
    content: str
    suggestions: Optional[List[str]] = []

class ChatMessageOut(BaseModel):
    id: int
    session_id: int
    sender: str
    content: str
    suggestions: Optional[List[str]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class ChatSessionOut(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageOut] = []

    model_config = ConfigDict(from_attributes=True)

class ForecastRequest(BaseModel):
    metric_type: str # bookings_farm, bookings_homestay, sales_product
    days: int = 7

class ForecastItem(BaseModel):
    date: str
    predicted_value: float

class ForecastResponse(BaseModel):
    metric_type: str
    forecast: List[ForecastItem]
    model_accuracy: float # R-squared mock

class SentimentResponse(BaseModel):
    text: str
    sentiment_score: float
    sentiment_label: str # positive, neutral, negative
