import api from './api.js';

export const purchaseOrderService = {
  // Get All Purchase Orders
  getPurchaseOrders: async (params = {}) => {
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

      const response = await api.get(`/purchaseOrder?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Purchase Order by ID
  getPurchaseOrderById: async (orderId) => {
    try {
      const response = await api.get(`/purchaseOrder/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create Purchase Order (Manager/Admin Only)
  createPurchaseOrder: async (orderData) => {
    try {
      const response = await api.post('/purchaseOrder', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update Purchase Order (Manager/Admin Only)
  updatePurchaseOrder: async (orderId, orderData) => {
    try {
      const response = await api.put(`/purchaseOrder/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Receive Goods (Staff+)
  receiveGoods: async (orderId, receivedData) => {
    try {
      const response = await api.patch(`/purchaseOrder/${orderId}/receive`, receivedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel Purchase Order (Manager/Admin Only)
  cancelPurchaseOrder: async (orderId, reason) => {
    try {
      const response = await api.patch(`/purchaseOrder/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete Purchase Order (Manager/Admin Only)
  deletePurchaseOrder: async (orderId) => {
    try {
      const response = await api.delete(`/purchaseOrder/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default purchaseOrderService;
