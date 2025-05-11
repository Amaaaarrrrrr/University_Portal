import axios from 'axios';

// Create axios instance with default config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Create API service functions for different endpoints
export const courseService = {
  getAllCourses: () => api.get('/api/courses'),
  getCourseById: (id: string) => api.get(`/api/courses/${id}`),
};

export const studentService = {
  getProfile: () => api.get('/api/profile'),
  registerUnits: (data: any) => api.post('/api/registration', data),
  getFees: () => api.get('/api/payments'),
  getFeeStructure: () => api.get('/api/fee-structure'),
  getClearanceStatus: () => api.get('/api/clearance'),
};

export const lecturerService = {
  getCourses: () => api.get('/api/courses'),
  submitGrades: (data: any) => api.post('/api/grades', data),
  getGrades: (courseId: string) => api.get(`/api/grades?courseId=${courseId}`),
  createAnnouncement: (data: any) => api.post('/api/announcements', data),
};

export const adminService = {
  getDashboardStats: () => api.get('/api/admin_dashboard'),
  getAllUsers: () => api.get('/api/users'),
  createUser: (data: any) => api.post('/api/register', data),
  manageFees: (data: any) => api.post('/api/fee-structure', data),
  assignLecturers: (data: any) => api.post('/admin/assign_lecturer', data),
};