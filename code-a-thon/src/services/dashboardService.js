import api from './api.js';

export const dashboardService = {
  // Get Dashboard Overview
  getDashboardOverview: async () => {
    try {
      const response = await api.get('/dashboard/overview');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Inventory Report
  getInventoryReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/dashboard/inventory-report?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Sales Report
  getSalesReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/dashboard/sales-report?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Purchase Report
  getPurchaseReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/dashboard/purchase-report?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Profit & Loss Report
  getProfitLossReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/dashboard/profit-loss-report?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default dashboardService;
