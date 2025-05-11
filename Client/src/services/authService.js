import { api } from './api';

export const authService = {
  // Mock login function
  async login(email, password) {
    try {
      // In a real app, this would make an API call
      const response = await api.post('/api/login', { email, password });
      
      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      
      return response.data.user;
    } catch (error) {
      console.error('Authentication failed', error);
      // Mock login data based on email role for demo purposes
      return this.getMockUser(email);
    }
  },

  // Mock register function
  async register(email, password, role) {
    try {
      // In a real app, this would make an API call
      const response = await api.post('/api/register', { email, password, role });

      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);

      return response.data.user;
    } catch (error) {
      console.error('Registration failed', error);
      // Mock registration data based on role
      return this.getMockUser(email, role);
    }
  },

  // Function to fetch current user (based on mock data)
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      const response = await api.get('/api/profile');
      return response.data;
    } catch (error) {
      const token = localStorage.getItem('token');
      if (token) {
        return this.getMockUser('mock@example.com');
      }
      localStorage.removeItem('token');
      return null;
    }
  },

  // Helper function to generate mock user based on email and role
  getMockUser(email, role = null) {
    let mockUser = {
      id: '123',
      name: 'Demo User',
      email: email,
      profilePicture: null,
    };

    // Role is set based on email prefix for demo
    if (!role) {
      role = this.getRoleFromEmail(email);
    }

    mockUser.role = role;
    mockUser.name = this.getMockUserName(role);

    return mockUser;
  },

  // Function to infer role based on email (for demo purposes)
  getRoleFromEmail(email) {
    if (email.startsWith('student')) {
      return 'student';
    } else if (email.startsWith('lecturer')) {
      return 'lecturer';
    } else if (email.startsWith('admin')) {
      return 'admin';
    }
    return 'student';  // Default to student
  },

  // Function to set mock user name based on role
  getMockUserName(role) {
    if (role === 'student') {
      return 'John Student';
    } else if (role === 'lecturer') {
      return 'Dr. Jane Professor';
    } else if (role === 'admin') {
      return 'Admin User';
    }
    return 'Demo User';  // Default name
  },

  logout() {
    localStorage.removeItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};
