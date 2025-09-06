import api from './api.js';

export const supplierService = {
  // Get All Suppliers
  getSuppliers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Default parameters
      const defaultParams = {
        status: 'active',
        page: 1,
        limit: 10
      };
      
      const finalParams = { ...defaultParams, ...params };
      
      Object.keys(finalParams).forEach(key => {
        if (finalParams[key] !== undefined && finalParams[key] !== null && finalParams[key] !== '') {
          queryParams.append(key, finalParams[key]);
        }
      });

      const response = await api.get(`/supplier?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Supplier by ID
  getSupplierById: async (supplierId) => {
    try {
      const response = await api.get(`/supplier/${supplierId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create Supplier (Manager/Admin Only)
  createSupplier: async (supplierData) => {
    try {
      const response = await api.post('/supplier', supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update Supplier (Manager/Admin Only)
  updateSupplier: async (supplierId, supplierData) => {
    try {
      const response = await api.put(`/supplier/${supplierId}`, supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete Supplier (Manager/Admin Only)
  deleteSupplier: async (supplierId) => {
    try {
      const response = await api.delete(`/supplier/${supplierId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get Supplier Statistics
  getSupplierStats: async (supplierId) => {
    try {
      const response = await api.get(`/supplier/${supplierId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default supplierService;
