import os
from typing import List, Dict, Any, Tuple
from app.core.config import settings

class GeminiService:
    SYSTEM_PROMPT = """You are RuralConnect AI Assistant, an expert AI advisor for the RuralConnect AI platform.
RuralConnect AI connects organic farmers, eco-tourism homestays, rural craft producers, and conscious travelers in a single sustainable ecosystem.

Your role:
- Answer traveler and customer queries about booking organic farm tours, homestay reservations, and purchasing natural farm produce.
- Assist farmers with crop advice, organic techniques, listing products in the marketplace, and maximizing farm yield.
- Guide homestay hosts on hospitality standards, pricing, and guest experience.
- Provide friendly, informative, and concise responses with actionable suggestions.
- Do NOT talk about unrelated topics. Keep all responses focused strictly on RuralConnect AI and rural eco-tourism/farming.
"""

    @classmethod
    def generate_chat_response(cls, message: str, history: List[Dict[str, Any]] = None) -> Tuple[str, List[str]]:
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "YOUR_GEMINI_API_KEY":
            raise ValueError(
                "Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env."
            )

        prompt = f"{cls.SYSTEM_PROMPT}\n\nUser Question: {message}"
        if history:
            hist_str = "\n".join([f"User: {h.get('message', '')}\nAssistant: {h.get('reply', '')}" for h in history[-5:]])
            prompt = f"{cls.SYSTEM_PROMPT}\n\nRecent History:\n{hist_str}\n\nUser Question: {message}"

        suggestions = [
            "How do I book a homestay?",
            "What products are in the marketplace?",
            "Tell me about sustainable farming"
        ]

        # 1. Try google-genai Client SDK (New Google GenAI SDK)
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response and response.text:
                return response.text.strip(), suggestions
        except Exception:
            pass

        # 2. Try google-generativeai SDK
        try:
            import google.generativeai as genai_legacy
            genai_legacy.configure(api_key=api_key)
            for model_name in ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"]:
                try:
                    model = genai_legacy.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    if response and response.text:
                        return response.text.strip(), suggestions
                except Exception:
                    continue
        except Exception as e:
            raise RuntimeError(f"Gemini API error: {str(e)}")

        raise RuntimeError("Failed to generate response from Gemini API.")
