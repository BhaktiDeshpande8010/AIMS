import api from './api';

const adminService = {
  // Get admin dashboard data
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get pending approvals
  getPendingApprovals: async (params = {}) => {
    try {
      const response = await api.get('/admin/approvals', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve an item
  approveItem: async (type, id, notes = '') => {
    try {
      const response = await api.post(`/admin/approve/${type}/${id}`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject an item
  rejectItem: async (type, id, reason, notes = '') => {
    try {
      const response = await api.post(`/admin/reject/${type}/${id}`, { reason, notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get system logs
  getSystemLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/logs', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get system statistics
  getSystemStats: async (timeframe = '7d') => {
    try {
      const response = await api.get('/admin/stats', { params: { timeframe } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk approve items
  bulkApprove: async (items) => {
    try {
      const promises = items.map(item => 
        adminService.approveItem(item.type, item.id, item.notes)
      );
      const results = await Promise.allSettled(promises);
      return results;
    } catch (error) {
      throw error;
    }
  },

  // Bulk reject items
  bulkReject: async (items) => {
    try {
      const promises = items.map(item => 
        adminService.rejectItem(item.type, item.id, item.reason, item.notes)
      );
      const results = await Promise.allSettled(promises);
      return results;
    } catch (error) {
      throw error;
    }
  },

  // Get approval statistics
  getApprovalStats: async () => {
    try {
      const response = await adminService.getDashboard();
      return response.data.pendingApprovals;
    } catch (error) {
      throw error;
    }
  },

  // Export system logs
  exportLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/logs/export', { 
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user activity summary
  getUserActivity: async (userId, timeframe = '30d') => {
    try {
      const response = await api.get(`/admin/users/${userId}/activity`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default adminService;
