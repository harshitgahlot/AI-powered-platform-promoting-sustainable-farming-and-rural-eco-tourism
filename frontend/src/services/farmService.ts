import api from './api';

export interface FarmImage {
  id: number;
  url: string;
}

export interface Farm {
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
  images: FarmImage[];
}

export interface FarmListResponse {
  items: Farm[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const farmService = {
  list: async (params?: { page?: number; limit?: number; search?: string; status?: string; sort?: string }): Promise<FarmListResponse> => {
    const res = await api.get('/farms', { params });
    return res.data;
  },
  get: async (id: number): Promise<Farm> => {
    const res = await api.get(`/farms/${id}`);
    return res.data;
  },
  getMyProfile: async (): Promise<Farm> => {
    const res = await api.get('/farms/my-profile');
    return res.data;
  },
  create: async (data: Partial<Farm>): Promise<Farm> => {
    const res = await api.post('/farms', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Farm>): Promise<Farm> => {
    const res = await api.put(`/farms/${id}`, data);
    return res.data;
  },
  uploadImage: async (id: number, file: File): Promise<FarmImage> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/farms/${id}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  approve: async (id: number, status: string): Promise<Farm> => {
    const res = await api.put(`/farms/${id}/approve`, { status });
    return res.data;
  }
};
