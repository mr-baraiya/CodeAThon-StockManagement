import api from './api.js';

export const salesService = {
  // Get All Sales
  getSales: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Default parameters
      const defaultParams = {
        page: 1,
        limit: 20
      };
      
      const finalParams = { ...defaultParams, ...params };
      
      Object.keys(finalParams).forEach(key => {
        if (finalParams[key] !== undefined && finalParams[key] !== null && finalParams[key] !== '') {
          queryParams.append(key, finalParams[key]);
        }
      });

      const response = await api.get(`/sales?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Sales Statistics
  getSalesStats: async (period = 'today') => {
    try {
      const response = await api.get(`/sales/stats?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Sale by ID
  getSaleById: async (saleId) => {
    try {
      const response = await api.get(`/sales/${saleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create Sale (Staff+)
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Record Payment (Staff+)
  recordPayment: async (saleId, paymentData) => {
    try {
      const response = await api.patch(`/sales/${saleId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update Sale (Manager/Admin Only)
  updateSale: async (saleId, saleData) => {
    try {
      const response = await api.put(`/sales/${saleId}`, saleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel Sale (Manager/Admin Only)
  cancelSale: async (saleId, reason) => {
    try {
      const response = await api.patch(`/sales/${saleId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default salesService;
