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
    // For demo purposes, simulate successful responses
    if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
      console.log('API Error intercepted in development mode. Providing mock data.');
      
      // Mock response handler - for demonstration only
      const mockResponse = generateMockResponse(error.config);
      if (mockResponse) {
        return Promise.resolve(mockResponse);
      }
    }
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock response generator for development
function generateMockResponse(config) {
  const url = config.url;
  const method = config.method;
  
  // Mock courses data
  if (url.includes('/api/courses') && method === 'get') {
    return {
      data: [
        { id: '1', code: 'CS101', title: 'Introduction to Computer Science', credits: 3, instructor: 'Dr. Smith' },
        { id: '2', code: 'MATH201', title: 'Advanced Calculus', credits: 4, instructor: 'Dr. Johnson' },
        { id: '3', code: 'ENG105', title: 'College Writing', credits: 3, instructor: 'Prof. Williams' },
        { id: '4', code: 'BIO150', title: 'General Biology', credits: 4, instructor: 'Dr. Brown' },
      ]
    };
  }
  
  // Mock profile data
  if (url.includes('/api/profile') && method === 'get') {
    return {
      data: {
        id: '123',
        name: 'Demo User',
        email: 'student@example.com',
        role: 'student',
        studentId: 'STU22001',
        department: 'Computer Science',
        year: 2,
        semester: 'Fall',
        gpa: 3.7,
        enrollmentStatus: 'Active',
        profilePicture: null
      }
    };
  }
  
  // Mock payments data
  if (url.includes('/api/payments') && method === 'get') {
    return {
      data: [
        { id: '1', amount: 1500, date: '2023-09-01', description: 'Tuition Fee - Fall 2023', status: 'Paid' },
        { id: '2', amount: 300, date: '2023-09-15', description: 'Library Fee', status: 'Paid' },
        { id: '3', amount: 1500, date: '2024-01-15', description: 'Tuition Fee - Spring 2024', status: 'Pending' },
      ]
    };
  }
  
  // Default - return null to let the error pass through
  return null;
}

// Create API service functions for different endpoints
export const courseService = {
  getAllCourses: () => api.get('/api/courses'),
  getCourseById: (id) => api.get(`/api/courses/${id}`),
};

export const studentService = {
  getProfile: () => api.get('/api/profile'),
  registerUnits: (data) => api.post('/api/registration', data),
  getFees: () => api.get('/api/payments'),
  getFeeStructure: () => api.get('/api/fee-structure'),
  getClearanceStatus: () => api.get('/api/clearance'),
};

export const lecturerService = {
  getCourses: () => api.get('/api/courses'),
  submitGrades: (data) => api.post('/api/grades', data),
  getGrades: (courseId) => api.get(`/api/grades?courseId=${courseId}`),
  createAnnouncement: (data) => api.post('/api/announcements', data),
};

export const adminService = {
  getDashboardStats: () => api.get('/api/admin_dashboard'),
  getAllUsers: () => api.get('/api/users'),
  createUser: (data) => api.post('/api/register', data),
  manageFees: (data) => api.post('/api/fee-structure', data),
  assignLecturers: (data) => api.post('/admin/assign_lecturer', data),
};