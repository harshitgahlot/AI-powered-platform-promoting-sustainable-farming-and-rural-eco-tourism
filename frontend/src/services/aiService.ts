import api from './api';
import type { Farm } from './farmService';
import type { Homestay } from './homestayService';

export interface ChatResponse {
  reply: string;
  suggestions: string[];
}

export interface ForecastItem {
  date: string;
  predicted_value: number;
}

export interface ForecastResponse {
  metric_type: string;
  forecast: ForecastItem[];
  model_accuracy: number;
}

export interface SentimentResponse {
  text: string;
  sentiment_score: number;
  sentiment_label: string;
}

export const aiService = {
  chatbotQuery: async (message: string, history: Array<{ message: string; reply: string }> = []): Promise<ChatResponse> => {
    const formattedHistory = history.map(h => ({
      message: h.message,
      reply: h.reply
    }));
    const res = await api.post('/ai/chatbot', { message, history: formattedHistory });
    return res.data;
  },
  getRecommendedFarms: async (): Promise<Farm[]> => {
    const res = await api.get('/ai/recommendations/farms');
    return res.data;
  },
  getRecommendedHomestays: async (): Promise<Homestay[]> => {
    const res = await api.get('/ai/recommendations/homestays');
    return res.data;
  },
  analyzeSentiment: async (text: string): Promise<SentimentResponse> => {
    const res = await api.post(`/ai/sentiment?review_text=${encodeURIComponent(text)}`);
    return res.data;
  },
  getDemandForecast: async (metricType: string, days: number = 7): Promise<ForecastResponse> => {
    const res = await api.post('/ai/forecast', { metric_type: metricType, days });
    return res.data;
  }
};
