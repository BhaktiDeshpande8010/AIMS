import api from './api';

export const employeeService = {
  // Get all employees
  getEmployees: async () => {
    try {
      const response = await api.get('/employees');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create procurement request
  createProcurementRequest: async (employeeId, requestData) => {
    try {
      const response = await api.post(`/employees/${employeeId}/procurement`, requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
