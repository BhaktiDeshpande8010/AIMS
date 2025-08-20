import api from './api';

export const customerService = {
  // Get all customers
  getCustomers: async () => {
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new customer
  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get customer by ID
  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create Individual Customer with file uploads
  createIndividualCustomer: async (formData) => {
    try {
      const response = await api.post('/customers/individual', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create Organizational Customer with file uploads
  createOrganizationalCustomer: async (formData) => {
    try {
      const response = await api.post('/customers/organizational', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate customer receipt
  generateReceipt: async (id) => {
    try {
      const response = await api.get(`/customers/${id}/receipt`, {
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send OTP for verification
  sendOTP: async (phoneNumber) => {
    try {
      const response = await api.post('/customers/send-otp', { phoneNumber });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (phoneNumber, otp) => {
    try {
      const response = await api.post('/customers/verify-otp', { phoneNumber, otp });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
