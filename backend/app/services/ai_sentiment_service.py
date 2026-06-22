from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from typing import Tuple

class AISentimentService:
    # A balanced dataset to train the logistic regression classifier at startup
    TRAINING_DATA = [
        # Positive review sentences
        ("great farm amazing homestay beautiful views very nice friendly owner delicious food fresh produce", 1),
        ("loved the experience and hospitality peaceful atmosphere super clean room definitely recommend", 1),
        ("tasty organic vegetables quiet environment wonderful hosts lovely cottage helpful guides", 1),
        ("excellent service local guide was extremely friendly beds were comfortable neat garden", 1),
        ("perfect place for a weekend getaway highly recommend the milk and honey healthy foods", 1),
        # Negative review sentences
        ("awful room dirty bed bad service rude farmer expensive poor quality terrible experience", 0),
        ("very noisy mosquitoes everywhere unhygienic washroom not recommended overpriced bad food", 0),
        ("rude host dirty sheets cold water didn't work broken lock smells bad small room", 0),
        ("overpriced tour nothing to see waste of money poor communication hard to locate", 0),
        ("disappointed service slow room not prepared broken fan unclean sheets horrible stay", 0)
    ]
    
    _pipeline = None

    @classmethod
    def _initialize_model(cls):
        """Trains the pipeline on boot if not already loaded."""
        if cls._pipeline is not None:
            return
            
        texts = [item[0] for item in cls.TRAINING_DATA]
        labels = [item[1] for item in cls.TRAINING_DATA]
        
        # Build the pipeline
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(stop_words='english', min_df=1)),
            ('clf', LogisticRegression(C=1.0))
        ])
        
        pipeline.fit(texts, labels)
        cls._pipeline = pipeline

    @classmethod
    def analyze_sentiment(cls, text: str) -> Tuple[float, str]:
        """
        Analyzes the review sentiment.
        Returns a tuple: (sentiment_score [-1.0 to 1.0], label ["positive", "neutral", "negative"])
        """
        if not text.strip():
            return 0.0, "neutral"
            
        cls._initialize_model()
        
        # Get probability of class 1 (positive)
        # predict_proba returns [[prob_0, prob_1]]
        probs = cls._pipeline.predict_proba([text])[0]
        prob_pos = probs[1]
        
        # Map [0, 1] probability to [-1.0, 1.0] scale
        sentiment_score = (prob_pos * 2.0) - 1.0
        
        # Categorize label
        if sentiment_score > 0.15:
            label = "positive"
        elif sentiment_score < -0.15:
            label = "negative"
        else:
            label = "neutral"
            
        return round(float(sentiment_score), 2), label
