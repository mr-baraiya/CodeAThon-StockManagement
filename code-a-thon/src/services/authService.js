import api from './api.js';

export const authService = {
  // User Registration
  register: async (userData) => {
    try {
      const response = await api.post('/user/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // User Login
  login: async (credentials) => {
    try {
      const response = await api.post('/user/login', credentials);
      const { token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get User Profile
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update User Profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      // Update stored user data
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get current user token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check user role
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  // Check if user has minimum role level
  hasMinimumRole: (minimumRole) => {
    const user = authService.getCurrentUser();
    const roleHierarchy = { 'staff': 1, 'manager': 2, 'admin': 3 };
    const userLevel = roleHierarchy[user?.role] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 0;
    return userLevel >= requiredLevel;
  }
};

export default authService;
