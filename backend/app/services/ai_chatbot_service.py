from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.schemas.ai import ChatResponse
from typing import List, Dict, Any

class AIChatbotService:
    # A rich local knowledge base of sustainable farming, ecotourism, homestays, and platform FAQs
    KNOWLEDGE_BASE = [
        {
            "question": "What is RuralConnect AI?",
            "answer": "RuralConnect AI is an all-in-one digital platform that empowers rural communities by linking organic farming, eco-tourism homestays, marketplace trade, and AI analytics in a single ecosystem.",
            "suggestions": ["How can I book a homestay?", "How do I sell my crops?"]
        },
        {
            "question": "How do I book a homestay room?",
            "answer": "To book a homestay room: 1. Navigate to the 'Homestay Listings' page. 2. Filter by location and price. 3. Select a homestay to view detailed room listings. 4. Choose your dates and click 'Book Room'.",
            "suggestions": ["Can I cancel my homestay booking?", "What is the check-in time?"]
        },
        {
            "question": "How can farmers add products to the marketplace?",
            "answer": "Farmers can log in, access the 'Farmer Dashboard', and click the 'Add Product' button. Fill in the product details, stock, price, upload images, and click save. Admin will approve it shortly.",
            "suggestions": ["What categories are supported?", "How do product approvals work?"]
        },
        {
            "question": "What are the benefits of sustainable farming and eco-tourism?",
            "answer": "Sustainable farming preserves soil quality and health, while eco-tourism brings economic development to rural communities without harming nature. RuralConnect AI connects both to maximize rural incomes.",
            "suggestions": ["Are the products organic?", "What activities can I do at a farm?"]
        },
        {
            "question": "How do I cancel my reservation?",
            "answer": "You can manage and cancel all of your active homestay bookings and farm visits in the 'Booking Management' section of your Tourist Dashboard.",
            "suggestions": ["Is there a cancellation fee?", "How long does a refund take?"]
        },
        {
            "question": "What product categories are available in the marketplace?",
            "answer": "The marketplace lists products across multiple categories including: Fresh Fruits, Organic Vegetables, Dairy & Poultry, Grains & Pulses, Rural Handicrafts, and Pure Honey.",
            "suggestions": ["How do I buy products?", "Do you ship nationwide?"]
        },
        {
            "question": "Is there support for interactive maps?",
            "answer": "Yes! All approved farms and homestays feature latitude and longitude coordinates. This enables our interactive map visualization and calculates nearby spots relative to your location.",
            "suggestions": ["Where can I see the map?", "How are coordinates set?"]
        }
    ]

    _vectorizer = None
    _tfidf_matrix = None
    _corpus = []

    @classmethod
    def _initialize_chatbot(cls):
        if cls._vectorizer is not None:
            return
            
        cls._corpus = [item["question"] for item in cls.KNOWLEDGE_BASE]
        cls._vectorizer = TfidfVectorizer(stop_words='english')
        cls._tfidf_matrix = cls._vectorizer.fit_transform(cls._corpus)

    @classmethod
    def get_chat_response(cls, message: str, history: List[Dict[str, Any]] = None) -> ChatResponse:
        """
        Retrieves the most semantically relevant answer to the user's message.
        Falls back to a polite conversational response if similarity is low.
        """
        cls._initialize_chatbot()
        
        # Transform user message
        user_vector = cls._vectorizer.transform([message])
        
        # Calculate cosine similarity against questions
        sim_scores = cosine_similarity(user_vector, cls._tfidf_matrix).flatten()
        best_idx = int(sim_scores.argmax())
        best_score = float(sim_scores[best_idx])
        
        # If match is strong enough, return the answer
        if best_score > 0.25:
            matched_faq = cls.KNOWLEDGE_BASE[best_idx]
            return ChatResponse(
                reply=matched_faq["answer"],
                suggestions=matched_faq["suggestions"]
            )
            
        # Fallback responses based on keyword parsing
        lower_msg = message.lower()
        if "hello" in lower_msg or "hi " in lower_msg or lower_msg == "hi":
            return ChatResponse(
                reply="Hello! Welcome to RuralConnect AI chatbot. I'm here to guide you through booking farm experiences, ordering organic products, or locating homestays. How can I help you today?",
                suggestions=["What is RuralConnect AI?", "How do I book a homestay room?"]
            )
        elif "thank" in lower_msg:
            return ChatResponse(
                reply="You are very welcome! If you have any other questions about eco-tourism or organic farming, feel free to ask.",
                suggestions=["What is RuralConnect AI?", "What product categories are available?"]
            )
            
        # Generic fallback
        return ChatResponse(
            reply="Thank you for your question. I couldn't find a direct match in my knowledge base. RuralConnect AI enables tourists to visit organic farms, book homestays, and buy natural farm products directly from local entrepreneurs. Would you like to explore one of these options?",
            suggestions=["What is RuralConnect AI?", "How do I book a homestay room?", "What product categories are available?"]
        )
class_name = AIChatbotService
