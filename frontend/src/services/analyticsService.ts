import api from './api';

export interface DailyMetric {
  id: number;
  date: string;
  total_revenue: number;
  bookings_count: number;
  orders_count: number;
  active_users: number;
}

export interface MonthlyMetric {
  id: number;
  year: number;
  month: number;
  total_revenue: number;
  bookings_count: number;
  orders_count: number;
  active_users: number;
}

export interface PlatformAnalytics {
  total_users: number;
  total_farmers: number;
  total_homestay_owners: number;
  total_revenue: number;
  total_bookings: number;
  total_orders: number;
  daily_history: DailyMetric[];
  monthly_history: MonthlyMetric[];
}

export const analyticsService = {
  getAnalytics: async (): Promise<PlatformAnalytics> => {
    const res = await api.get('/analytics');
    return res.data;
  }
};
