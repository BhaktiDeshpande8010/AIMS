import api from './api';

export const vendorService = {
  // Get all vendors with filtering and pagination
  getVendors: async (params = {}) => {
    try {
      const response = await api.get('/vendors', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new vendor
  createVendor: async (vendorData) => {
    try {
      const response = await api.post('/vendors', vendorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get vendor by ID
  getVendorById: async (id) => {
    try {
      const response = await api.get(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update vendor
  updateVendor: async (id, vendorData) => {
    try {
      const response = await api.put(`/vendors/${id}`, vendorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete vendor
  deleteVendor: async (id) => {
    try {
      const response = await api.delete(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get vendors by type
  getVendorsByType: async (type) => {
    try {
      const response = await api.get(`/vendors/type/${type}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send OTP
  sendOTP: async (email, purpose = 'vendor_registration') => {
    try {
      const response = await api.post('/vendors/send-otp', { email, purpose });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp, purpose = 'vendor_registration') => {
    try {
      const response = await api.post('/vendors/verify-otp', { email, otp, purpose });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Activate vendor
  activateVendor: async (id) => {
    try {
      const response = await api.patch(`/vendors/${id}/activate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Deactivate vendor
  deactivateVendor: async (id) => {
    try {
      const response = await api.patch(`/vendors/${id}/deactivate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
