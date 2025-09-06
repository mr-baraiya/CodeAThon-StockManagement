import api from './api.js';

export const productService = {
  // Get All Products
  getProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all parameters to query string
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/product?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Product by ID
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create Product (Manager/Admin Only)
  createProduct: async (productData) => {
    try {
      const response = await api.post('/product', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update Product (Manager/Admin Only)
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/product/${productId}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete Product (Manager/Admin Only)
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update Product Stock
  updateProductStock: async (productId, stockData) => {
    try {
      const response = await api.patch(`/product/${productId}/stock`, stockData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Low Stock Products
  getLowStockProducts: async () => {
    try {
      const response = await api.get('/product/low-stock');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Product Stock History
  getProductStockHistory: async (productId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/product/${productId}/stock-history?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default productService;
