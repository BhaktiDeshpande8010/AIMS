import api from './api';

export const dashboardService = {
  // Get dashboard data
  getDashboardData: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get summary statistics
  getSummaryStats: async () => {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get(`/dashboard/activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get latest purchases
  getLatestPurchases: async (limit = 5) => {
    try {
      const response = await api.get(`/purchases?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get latest vendors
  getLatestVendors: async (limit = 5) => {
    try {
      const response = await api.get(`/vendors?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get latest customers
  getLatestCustomers: async (limit = 5) => {
    try {
      const response = await api.get(`/customers?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get pending requests
  getPendingRequests: async () => {
    try {
      const response = await api.get('/requests?status=pending');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
