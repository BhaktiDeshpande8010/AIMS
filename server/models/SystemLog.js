import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
  // Action Information
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      // Authentication actions
      'USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'PASSWORD_CHANGE', 'PROFILE_UPDATE',
      
      // User management actions
      'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_ROLE_UPDATE', 'USER_STATUS_TOGGLE',
      
      // Vendor actions
      'VENDOR_CREATE', 'VENDOR_UPDATE', 'VENDOR_DELETE', 'VENDOR_APPROVE', 'VENDOR_REJECT',
      
      // Customer actions
      'CUSTOMER_CREATE', 'CUSTOMER_UPDATE', 'CUSTOMER_DELETE', 'CUSTOMER_APPROVE', 'CUSTOMER_REJECT',
      
      // Employee actions
      'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'EMPLOYEE_APPROVE', 'EMPLOYEE_REJECT',
      
      // Purchase Order actions
      'PURCHASE_CREATE', 'PURCHASE_UPDATE', 'PURCHASE_DELETE', 'PURCHASE_APPROVE', 'PURCHASE_REJECT',
      'PURCHASE_DELIVER', 'PURCHASE_INVOICE', 'PURCHASE_PAY', 'PURCHASE_CANCEL',
      
      // Procurement actions
      'PROCUREMENT_CREATE', 'PROCUREMENT_UPDATE', 'PROCUREMENT_DELETE', 'PROCUREMENT_APPROVE', 'PROCUREMENT_REJECT',
      
      // File actions
      'FILE_UPLOAD', 'FILE_DOWNLOAD', 'FILE_DELETE',
      
      // System actions
      'SYSTEM_BACKUP', 'SYSTEM_RESTORE', 'SYSTEM_MAINTENANCE',
      
      // General actions
      'CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'
    ]
  },
  
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.userRole !== 'public';
    }
  },
  
  userName: {
    type: String,
    required: [true, 'User name is required']
  },
  
  userRole: {
    type: String,
    required: [true, 'User role is required'],
    enum: ['admin', 'accounts', 'public']
  },
  
  // Target Information (what was acted upon)
  targetType: {
    type: String,
    required: [true, 'Target type is required'],
    enum: ['User', 'Vendor', 'Customer', 'Employee', 'PurchaseOrder', 'Procurement', 'File', 'System']
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() {
      return this.targetType !== 'System';
    }
  },
  
  targetName: {
    type: String,
    required: [true, 'Target name is required']
  },
  
  // Action Details
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Changes made (for update actions)
  changes: {
    before: {
      type: mongoose.Schema.Types.Mixed
    },
    after: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  
  // Request Information
  ipAddress: {
    type: String,
    required: [true, 'IP address is required']
  },
  
  userAgent: {
    type: String,
    required: [true, 'User agent is required']
  },
  
  // Status and Result
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'SUCCESS'
  },
  
  errorMessage: {
    type: String,
    maxlength: [1000, 'Error message cannot exceed 1000 characters']
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Severity level
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  
  // Session information
  sessionId: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted timestamp
systemLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toLocaleString();
});

// Virtual for action category
systemLogSchema.virtual('category').get(function() {
  if (this.action.includes('USER_') || this.action.includes('PROFILE_') || this.action.includes('PASSWORD_')) {
    return 'Authentication';
  } else if (this.action.includes('VENDOR_')) {
    return 'Vendor Management';
  } else if (this.action.includes('CUSTOMER_')) {
    return 'Customer Management';
  } else if (this.action.includes('EMPLOYEE_')) {
    return 'Employee Management';
  } else if (this.action.includes('PURCHASE_')) {
    return 'Purchase Management';
  } else if (this.action.includes('PROCUREMENT_')) {
    return 'Procurement Management';
  } else if (this.action.includes('FILE_')) {
    return 'File Management';
  } else if (this.action.includes('SYSTEM_')) {
    return 'System Administration';
  } else {
    return 'General';
  }
});

// Static method to log an action
systemLogSchema.statics.logAction = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging action:', error);
    throw error;
  }
};

// Static method to get logs with filters
systemLogSchema.statics.getLogs = async function(filters = {}, options = {}) {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId,
      action,
      targetType,
      status,
      severity,
      startDate,
      endDate,
      search
    } = options;

    // Build query
    const query = { ...filters };

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { targetName: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await this.find(query)
      .populate('userId', 'firstName lastName email role')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await this.countDocuments(query);

    return {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Error getting logs:', error);
    throw error;
  }
};

// Static method to get log statistics
systemLogSchema.statics.getLogStats = async function(timeframe = '7d') {
  try {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const stats = await this.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          successfulActions: { $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] } },
          failedActions: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          criticalActions: { $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] } },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalLogs: 1,
          successfulActions: 1,
          failedActions: 1,
          criticalActions: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          successRate: {
            $multiply: [
              { $divide: ['$successfulActions', '$totalLogs'] },
              100
            ]
          }
        }
      }
    ]);

    return stats[0] || {
      totalLogs: 0,
      successfulActions: 0,
      failedActions: 0,
      criticalActions: 0,
      uniqueUsers: 0,
      successRate: 0
    };
  } catch (error) {
    console.error('Error getting log stats:', error);
    throw error;
  }
};

// Indexes for performance
systemLogSchema.index({ userId: 1, createdAt: -1 });
systemLogSchema.index({ action: 1, createdAt: -1 });
systemLogSchema.index({ targetType: 1, targetId: 1 });
systemLogSchema.index({ status: 1, severity: 1 });
systemLogSchema.index({ createdAt: -1 });

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

export default SystemLog;
