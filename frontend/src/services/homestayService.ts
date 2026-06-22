import api from './api';

export interface Room {
  id: number;
  homestay_id: number;
  name: string;
  description: string;
  price_per_night: number;
  occupancy: number;
  is_available: boolean;
}

export interface HomestayImage {
  id: number;
  url: string;
}

export interface Homestay {
  id: number;
  owner_id: number;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  status: string;
  rating: number;
  created_at: string;
  images: HomestayImage[];
  rooms: Room[];
}

export interface HomestayListResponse {
  items: Homestay[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const homestayService = {
  list: async (params?: { page?: number; limit?: number; search?: string; status?: string; sort?: string }): Promise<HomestayListResponse> => {
    const res = await api.get('/homestays', { params });
    return res.data;
  },
  get: async (id: number): Promise<Homestay> => {
    const res = await api.get(`/homestays/${id}`);
    return res.data;
  },
  getMyProfile: async (): Promise<Homestay> => {
    const res = await api.get('/homestays/my-profile');
    return res.data;
  },
  create: async (data: Partial<Homestay>): Promise<Homestay> => {
    const res = await api.post('/homestays', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Homestay>): Promise<Homestay> => {
    const res = await api.put(`/homestays/${id}`, data);
    return res.data;
  },
  uploadImage: async (id: number, file: File): Promise<HomestayImage> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/homestays/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  approve: async (id: number, status: string): Promise<Homestay> => {
    const res = await api.put(`/homestays/${id}/approve`, { status });
    return res.data;
  },
  // Rooms operations
  listRooms: async (homestayId: number): Promise<Room[]> => {
    const res = await api.get(`/homestays/${homestayId}/rooms`);
    return res.data;
  },
  addRoom: async (homestayId: number, data: Partial<Room>): Promise<Room> => {
    const res = await api.post(`/homestays/${homestayId}/rooms`, data);
    return res.data;
  },
  updateRoom: async (roomId: number, data: Partial<Room>): Promise<Room> => {
    const res = await api.put(`/homestays/rooms/${roomId}`, data);
    return res.data;
  }
};
