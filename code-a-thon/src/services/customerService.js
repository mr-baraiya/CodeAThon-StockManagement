import api from './api.js';

const customerService = {
  // Get all customers with optional query parameters
  getCustomers: async (params = {}) => {
    try {
      const response = await api.get('/customers', { params });
      return {
        success: true,
        data: response.data.data || response.data || [],
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get a single customer by ID
  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  // Create a new customer
  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/customers', customerData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update an existing customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete a customer
  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Search customers by name, email, or phone
  searchCustomers: async (searchTerm) => {
    try {
      const response = await api.get('/customers/search', {
        params: { q: searchTerm }
      });
      return {
        success: true,
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }
};

export default customerService;
