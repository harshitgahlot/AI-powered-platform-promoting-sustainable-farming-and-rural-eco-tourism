import api from './api';
import type { Farm } from './farmService';
import type { Room } from './homestayService';

export interface FarmBooking {
  id: number;
  tourist_id: number;
  farm_id: number;
  visit_date: string;
  number_of_guests: number;
  total_price: number;
  status: string; // pending, confirmed, cancelled, completed
  created_at: string;
  farm: Farm;
  tourist?: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface HomestayBooking {
  id: number;
  tourist_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string; // pending, confirmed, cancelled, completed
  created_at: string;
  room: Room;
  tourist?: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface BookingsResponse {
  farm_bookings: FarmBooking[];
  homestay_bookings: HomestayBooking[];
}

export const bookingService = {
  createFarmBooking: async (data: { farm_id: number; visit_date: string; number_of_guests: number }): Promise<FarmBooking> => {
    const res = await api.post('/bookings/farms', data);
    return res.data;
  },
  createHomestayBooking: async (data: { room_id: number; check_in: string; check_out: string }): Promise<HomestayBooking> => {
    const res = await api.post('/bookings/homestays', data);
    return res.data;
  },
  list: async (): Promise<BookingsResponse> => {
    const res = await api.get('/bookings');
    return res.data;
  },
  updateFarmBookingStatus: async (bookingId: number, status: string): Promise<FarmBooking> => {
    const res = await api.put(`/bookings/farms/${bookingId}/status`, { status });
    return res.data;
  },
  updateHomestayBookingStatus: async (bookingId: number, status: string): Promise<HomestayBooking> => {
    const res = await api.put(`/bookings/homestays/${bookingId}/status`, { status });
    return res.data;
  }
};
