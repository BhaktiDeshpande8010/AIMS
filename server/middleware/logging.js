import SystemLog from '../models/SystemLog.js';

// Middleware to automatically log actions
export const autoLog = (action, targetType, options = {}) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Call original res.json first
      originalJson.call(this, data);
      
      // Then log the action asynchronously
      setImmediate(async () => {
        try {
          if (req.user) {
            const logData = {
              action,
              userId: req.user._id,
              userName: req.user.fullName,
              userRole: req.user.role,
              targetType,
              targetId: req.params.id || req.body._id || null,
              targetName: options.getTargetName ? options.getTargetName(req, data) : (req.body.name || req.body.vendorName || req.body.customerName || req.body.firstName || 'Unknown'),
              description: options.getDescription ? options.getDescription(req, data) : `${action.replace('_', ' ').toLowerCase()} ${targetType.toLowerCase()}`,
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent') || 'Unknown',
              status: data.success ? 'SUCCESS' : 'FAILED',
              errorMessage: data.success ? null : data.message,
              severity: options.severity || 'MEDIUM',
              metadata: {
                method: req.method,
                url: req.originalUrl,
                body: req.method !== 'GET' ? req.body : null,
                params: req.params,
                query: req.query
              }
            };

            await SystemLog.logAction(logData);
          }
        } catch (error) {
          console.error('Error in auto-logging:', error);
        }
      });
    };

    next();
  };
};

// Manual logging function
export const logAction = async (req, actionData) => {
  try {
    if (!req.user) {
      console.warn('Attempted to log action without authenticated user');
      return;
    }

    const logData = {
      userId: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown',
      status: 'SUCCESS',
      severity: 'MEDIUM',
      ...actionData
    };

    await SystemLog.logAction(logData);
  } catch (error) {
    console.error('Error in manual logging:', error);
  }
};

// Specific logging functions for different actions
export const logUserAction = (action, targetId, targetName, description, severity = 'MEDIUM') => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await logAction(req, {
          action,
          targetType: 'User',
          targetId,
          targetName,
          description,
          severity
        });
      }
    } catch (error) {
      console.error('Error logging user action:', error);
    }
    next();
  };
};

export const logVendorAction = (action, severity = 'MEDIUM') => {
  return autoLog(action, 'Vendor', {
    severity,
    getTargetName: (req, data) => req.body.vendorName || data.data?.vendorName || 'Unknown Vendor',
    getDescription: (req, data) => {
      const actionMap = {
        'VENDOR_CREATE': 'Created new vendor',
        'VENDOR_UPDATE': 'Updated vendor information',
        'VENDOR_DELETE': 'Deleted vendor',
        'VENDOR_APPROVE': 'Approved vendor registration',
        'VENDOR_REJECT': 'Rejected vendor registration'
      };
      return actionMap[action] || `${action.replace('_', ' ').toLowerCase()}`;
    }
  });
};

export const logCustomerAction = (action, severity = 'MEDIUM') => {
  return autoLog(action, 'Customer', {
    severity,
    getTargetName: (req, data) => req.body.customerName || data.data?.customerName || 'Unknown Customer',
    getDescription: (req, data) => {
      const actionMap = {
        'CUSTOMER_CREATE': 'Created new customer',
        'CUSTOMER_UPDATE': 'Updated customer information',
        'CUSTOMER_DELETE': 'Deleted customer',
        'CUSTOMER_APPROVE': 'Approved customer registration',
        'CUSTOMER_REJECT': 'Rejected customer registration'
      };
      return actionMap[action] || `${action.replace('_', ' ').toLowerCase()}`;
    }
  });
};

export const logEmployeeAction = (action, severity = 'MEDIUM') => {
  return autoLog(action, 'Employee', {
    severity,
    getTargetName: (req, data) => {
      const firstName = req.body.firstName || data.data?.firstName || '';
      const lastName = req.body.lastName || data.data?.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Employee';
    },
    getDescription: (req, data) => {
      const actionMap = {
        'EMPLOYEE_CREATE': 'Created new employee',
        'EMPLOYEE_UPDATE': 'Updated employee information',
        'EMPLOYEE_DELETE': 'Deleted employee',
        'EMPLOYEE_APPROVE': 'Approved employee registration',
        'EMPLOYEE_REJECT': 'Rejected employee registration'
      };
      return actionMap[action] || `${action.replace('_', ' ').toLowerCase()}`;
    }
  });
};

export const logPurchaseAction = (action, severity = 'MEDIUM') => {
  return autoLog(action, 'PurchaseOrder', {
    severity,
    getTargetName: (req, data) => req.body.poNumber || data.data?.poNumber || 'Unknown PO',
    getDescription: (req, data) => {
      const actionMap = {
        'PURCHASE_CREATE': 'Created new purchase order',
        'PURCHASE_UPDATE': 'Updated purchase order',
        'PURCHASE_DELETE': 'Deleted purchase order',
        'PURCHASE_APPROVE': 'Approved purchase order',
        'PURCHASE_REJECT': 'Rejected purchase order',
        'PURCHASE_DELIVER': 'Marked purchase order as delivered',
        'PURCHASE_INVOICE': 'Added invoice to purchase order',
        'PURCHASE_PAY': 'Marked purchase order as paid',
        'PURCHASE_CANCEL': 'Cancelled purchase order'
      };
      return actionMap[action] || `${action.replace('_', ' ').toLowerCase()}`;
    }
  });
};

export const logProcurementAction = (action, severity = 'MEDIUM') => {
  return autoLog(action, 'Procurement', {
    severity,
    getTargetName: (req, data) => req.body.requestId || data.data?.requestId || 'Unknown Request',
    getDescription: (req, data) => {
      const actionMap = {
        'PROCUREMENT_CREATE': 'Created new procurement request',
        'PROCUREMENT_UPDATE': 'Updated procurement request',
        'PROCUREMENT_DELETE': 'Deleted procurement request',
        'PROCUREMENT_APPROVE': 'Approved procurement request',
        'PROCUREMENT_REJECT': 'Rejected procurement request'
      };
      return actionMap[action] || `${action.replace('_', ' ').toLowerCase()}`;
    }
  });
};

export const logFileAction = (action, fileName, severity = 'LOW') => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await logAction(req, {
          action,
          targetType: 'File',
          targetId: null,
          targetName: fileName || req.file?.filename || 'Unknown File',
          description: `${action.replace('_', ' ').toLowerCase()} file: ${fileName || req.file?.filename || 'Unknown'}`,
          severity
        });
      }
    } catch (error) {
      console.error('Error logging file action:', error);
    }
    next();
  };
};

export const logSystemAction = (action, description, severity = 'HIGH') => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await logAction(req, {
          action,
          targetType: 'System',
          targetId: null,
          targetName: 'System',
          description,
          severity
        });
      }
    } catch (error) {
      console.error('Error logging system action:', error);
    }
    next();
  };
};

// Error logging middleware
export const logError = async (error, req, res, next) => {
  try {
    if (req.user) {
      await logAction(req, {
        action: 'ERROR',
        targetType: 'System',
        targetId: null,
        targetName: 'System Error',
        description: `Error occurred: ${error.message}`,
        status: 'FAILED',
        errorMessage: error.stack,
        severity: 'HIGH'
      });
    }
  } catch (logError) {
    console.error('Error logging error:', logError);
  }
  next(error);
};

export default {
  autoLog,
  logAction,
  logUserAction,
  logVendorAction,
  logCustomerAction,
  logEmployeeAction,
  logPurchaseAction,
  logProcurementAction,
  logFileAction,
  logSystemAction,
  logError
};
