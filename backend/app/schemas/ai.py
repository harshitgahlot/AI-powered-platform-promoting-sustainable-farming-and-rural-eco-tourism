from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatQuery(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = []

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []

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
