// src/lib/api/auth.ts
import { apiClient } from './client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export const authApi = {
  async login(data: LoginData) {
    return apiClient.post('/auth/login', data);
  },

  async register(data: RegisterData) {
    return apiClient.post('/auth/register', data);
  },

  async logout() {
    return apiClient.post('/auth/logout');
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },

  async getUserInfo() {
    return apiClient.get('/user/info');
  }
};
