import { api } from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/api/login', { email, password });
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Authentication failed. Please check your credentials.');
    }
  },

  async register(data) {
    try {
      const response = await api.post('/api/register', data);
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please check your details and try again.');
    }
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await api.get('/api/profile');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch current user:', error);
      localStorage.removeItem('token');
      return null;
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};
