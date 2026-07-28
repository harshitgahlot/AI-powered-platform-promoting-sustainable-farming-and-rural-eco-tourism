import api from './api';
import type { Farm } from './farmService';
import type { Homestay } from './homestayService';

export interface ChatMessage {
  id: number;
  session_id: number;
  sender: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  created_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  suggestions: string[];
  session_id?: number;
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
  chatbotQuery: async (
    message: string,
    history: Array<{ message: string; reply: string }> = [],
    sessionId?: number
  ): Promise<ChatResponse> => {
    const formattedHistory = history.map(h => ({
      message: h.message,
      reply: h.reply
    }));
    const res = await api.post('/ai/chatbot', {
      message,
      history: formattedHistory,
      session_id: sessionId
    });
    return res.data;
  },

  // Chat Sessions CRUD
  getSessions: async (): Promise<ChatSession[]> => {
    const res = await api.get('/ai/sessions');
    return res.data;
  },

  createSession: async (title: string = 'New Conversation'): Promise<ChatSession> => {
    const res = await api.post('/ai/sessions', { title });
    return res.data;
  },

  getSession: async (sessionId: number): Promise<ChatSession> => {
    const res = await api.get(`/ai/sessions/${sessionId}`);
    return res.data;
  },

  deleteSession: async (sessionId: number): Promise<void> => {
    await api.delete(`/ai/sessions/${sessionId}`);
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
