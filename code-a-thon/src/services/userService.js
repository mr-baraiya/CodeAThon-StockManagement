import api from './api';

// User API endpoints
const USER_ENDPOINTS = {
  LOGIN: '/user/login',
  REGISTER: '/user/register',
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  ALL_USERS: '/user/users',
  USER_BY_ID: (id) => `/user/users/${id}`,
  UPDATE_USER: (id) => `/user/users/${id}`,
  DELETE_USER: (id) => `/user/users/${id}`,
};

// User API service
export const userService = {
  // Public endpoints
  register: async (userData) => {
    const response = await api.post(USER_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post(USER_ENDPOINTS.LOGIN, credentials);
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Protected endpoints
  getProfile: async () => {
    const response = await api.get(USER_ENDPOINTS.PROFILE);
    return response.data;
  },

  updateProfile: async (userId, userData) => {
    const response = await api.put(USER_ENDPOINTS.UPDATE_PROFILE, userData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put(USER_ENDPOINTS.CHANGE_PASSWORD, passwordData);
    return response.data;
  },

  // Admin endpoints
  getAllUsers: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    const response = await api.get(`${USER_ENDPOINTS.ALL_USERS}?${params}`);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(USER_ENDPOINTS.USER_BY_ID(userId));
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(USER_ENDPOINTS.UPDATE_USER(userId), userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(USER_ENDPOINTS.DELETE_USER(userId));
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.put(USER_ENDPOINTS.UPDATE_USER(userId), { status });
    return response.data;
  },
};

export default userService;
