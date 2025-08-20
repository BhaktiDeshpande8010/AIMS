import api from './api';

export const purchaseService = {
  // Get all purchases
  getPurchases: async () => {
    try {
      const response = await api.get('/purchases');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new purchase (with file upload support)
  createPurchase: async (purchaseData) => {
    try {
      // Check if purchaseData is FormData (for file uploads)
      const isFormData = purchaseData instanceof FormData;

      const config = {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
        }
      };

      const response = await api.post('/purchases', purchaseData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  },

  // Get purchase by ID
  getPurchaseById: async (id) => {
    try {
      const response = await api.get(`/purchases/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate invoice PDF
  generateInvoice: async (id) => {
    try {
      const response = await api.post(`/purchases/${id}/generate-invoice`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download invoice PDF
  downloadInvoice: async (id) => {
    try {
      const response = await api.get(`/purchases/${id}/download-invoice`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'invoice.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Workflow automation methods

  // Approve purchase order
  approvePurchase: async (id, approvalData) => {
    try {
      const response = await api.post(`/purchases/${id}/approve`, approvalData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark purchase as delivered
  markDelivered: async (id, deliveryData) => {
    try {
      const response = await api.post(`/purchases/${id}/deliver`, deliveryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark purchase as invoiced (with file upload)
  markInvoiced: async (id, invoiceData) => {
    try {
      const isFormData = invoiceData instanceof FormData;

      const config = {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
        }
      };

      const response = await api.post(`/purchases/${id}/invoice`, invoiceData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark purchase as paid
  markPaid: async (id, paymentData) => {
    try {
      const response = await api.post(`/purchases/${id}/pay`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject purchase order
  rejectPurchase: async (id, rejectionData) => {
    try {
      const response = await api.post(`/purchases/${id}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/purchases/dashboard-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // File download methods
  downloadQuotation: async (id) => {
    try {
      const response = await api.get(`/files/quotation/${id}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  downloadInvoiceFile: async (id) => {
    try {
      const response = await api.get(`/files/invoice/${id}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get file information
  getFileInfo: async (type, id) => {
    try {
      const response = await api.get(`/files/info/${type}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Export individual functions for easier importing
export const { getPurchases, createPurchase, getPurchaseById, generateInvoice, downloadInvoice } = purchaseService;

export default purchaseService;
