import api from './api.js';

export const categoryService = {
  // Get All Categories (Public)
  getCategories: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Default parameters
      const defaultParams = {
        status: 'active',
        includeSubcategories: 'true'
      };
      
      const finalParams = { ...defaultParams, ...params };
      
      Object.keys(finalParams).forEach(key => {
        if (finalParams[key] !== undefined && finalParams[key] !== null && finalParams[key] !== '') {
          queryParams.append(key, finalParams[key]);
        }
      });

      const response = await api.get(`/category?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Category by ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(`/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create Category (Admin Only)
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/category', categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update Category (Admin Only)
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/category/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete Category (Admin Only)
  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Subcategories
  getSubcategories: async (categoryId) => {
    try {
      const response = await api.get(`/category/${categoryId}/subcategories`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default categoryService;
