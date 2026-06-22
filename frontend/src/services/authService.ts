import api from './api';

export interface UserImage {
  id: number;
  url: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string; // tourist, farmer, homestay_owner, admin
  is_suspended: boolean;
  created_at: string;
  images: UserImage[];
}

export const authService = {
  register: async (data: any): Promise<User> => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  login: async (email: string, password: string): Promise<{ access_token: string; refresh_token: string; role: string }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await api.get('/users/me');
    return res.data;
  },
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await api.put('/users/me', data);
    return res.data;
  },
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/users/me/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  resetPassword: async (email: string, newPassword: string): Promise<any> => {
    const res = await api.post('/auth/reset-password', { email, new_password: newPassword });
    return res.data;
  },
  listUsers: async (): Promise<User[]> => {
    const res = await api.get('/users');
    return res.data;
  },
  suspendUser: async (id: number, isSuspended: boolean): Promise<User> => {
    const res = await api.put(`/users/${id}/suspend`, { is_suspended: isSuspended });
    return res.data;
  }
};
