import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.farm import Farm
from app.models.homestay import Homestay
from app.models.booking import FarmBooking, HomestayBooking
from app.repositories.farm_repository import FarmRepository
from app.repositories.homestay_repository import HomestayRepository
from typing import List, Union

class BaseRecommender:
    """
    Abstract architecture for our recommendation service, 
    making it modular and easy to upgrade to dense embeddings in Phase 2.
    """
    def fit_and_predict(self, user_profile: str, items: List[dict], limit: int) -> List[int]:
        raise NotImplementedError

class TFIDFRecommender(BaseRecommender):
    def fit_and_predict(self, user_profile: str, items: List[dict], limit: int) -> List[int]:
        if not items:
            return []
        
        # Extract text representations
        corpus = [item["text"] for item in items]
        
        # Initialize Vectorizer
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        # Vectorize user profile query
        user_vector = vectorizer.transform([user_profile])
        
        # Calculate cosine similarity
        sim_scores = cosine_similarity(user_vector, tfidf_matrix).flatten()
        
        # Sort items based on scores
        ranked_indices = np.argsort(sim_scores)[::-1]
        
        ranked_ids = [items[idx]["id"] for idx in ranked_indices]
        return ranked_ids[:limit]

class AIRecommendService:
    recommender = TFIDFRecommender()

    @classmethod
    def get_farm_recommendations(cls, db: Session, user_id: int, limit: int = 5) -> List[Farm]:
        # 1. Fetch user's booking history to understand interests
        stmt_fb = select(FarmBooking).where(FarmBooking.tourist_id == user_id)
        user_bookings = db.execute(stmt_fb).scalars().all()
        
        # Create user profile text from past bookings
        user_interests = []
        for booking in user_bookings:
            user_interests.append(f"{booking.farm.name} {booking.farm.description} {booking.farm.location}")
            
        # Default user profile if history is empty
        user_profile = " ".join(user_interests) if user_interests else "organic farming nature adventure trekking eco tourism fresh vegetables quiet peaceful"
        
        # 2. Fetch all approved farms
        all_farms = FarmRepository.list_farms(db, skip=0, limit=100, status="approved")
        if not all_farms:
            return []
            
        farm_data = []
        for farm in all_farms:
            text = f"{farm.name} {farm.description} {farm.location}"
            farm_data.append({"id": farm.id, "text": text, "obj": farm})
            
        # 3. Predict recommendations
        recommended_ids = cls.recommender.fit_and_predict(user_profile, farm_data, limit)
        
        # Map IDs back to farm objects in ranked order
        farm_dict = {f["id"]: f["obj"] for f in farm_data}
        return [farm_dict[fid] for fid in recommended_ids if fid in farm_dict]

    @classmethod
    def get_homestay_recommendations(cls, db: Session, user_id: int, limit: int = 5) -> List[Homestay]:
        # 1. Fetch user's homestay bookings history
        stmt_hb = select(HomestayBooking).where(HomestayBooking.tourist_id == user_id)
        user_bookings = db.execute(stmt_hb).scalars().all()
        
        user_interests = []
        for booking in user_bookings:
            homestay = booking.room.homestay
            user_interests.append(f"{homestay.name} {homestay.description} {homestay.location}")
            
        user_profile = " ".join(user_interests) if user_interests else "eco-friendly organic food traditional cottage mountains forest quiet relaxing wifi hot water"
        
        # 2. Fetch all approved homestays
        all_homestays = HomestayRepository.list_homestays(db, skip=0, limit=100, status="approved")
        if not all_homestays:
            return []
            
        homestay_data = []
        for h in all_homestays:
            text = f"{h.name} {h.description} {h.location}"
            homestay_data.append({"id": h.id, "text": text, "obj": h})
            
        # 3. Predict recommendations
        recommended_ids = cls.recommender.fit_and_predict(user_profile, homestay_data, limit)
        
        # Map IDs back to homestay objects in ranked order
        homestay_dict = {h["id"]: h["obj"] for h in homestay_data}
        return [homestay_dict[hid] for hid in recommended_ids if hid in homestay_dict]
