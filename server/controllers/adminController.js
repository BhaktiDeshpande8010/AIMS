import User from '../models/User.js';
import Employee from '../models/Employee.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Vendor from '../models/Vendor.js';
import Customer from '../models/Customer.js';
import SystemLog from '../models/SystemLog.js';
import mongoose from 'mongoose';

// Get admin dashboard statistics
export const getAdminDashboard = async (req, res) => {
  try {
    // Get comprehensive dashboard statistics
    const [
      pendingEmployees,
      pendingPurchases,
      pendingVendors,
      pendingCustomers,
      totalUsers,
      totalEmployees,
      totalVendors,
      totalCustomers,
      totalPurchases,
      recentLogs,
      systemStats
    ] = await Promise.all([
      Employee.countDocuments({ approvalStatus: 'Pending' }),
      PurchaseOrder.countDocuments({ approvalStatus: 'Pending' }),
      Vendor.countDocuments({ approvalStatus: 'Pending' }),
      Customer.countDocuments({ approvalStatus: 'Pending' }),
      User.countDocuments(),
      Employee.countDocuments(),
      Vendor.countDocuments(),
      Customer.countDocuments(),
      PurchaseOrder.countDocuments(),
      SystemLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'firstName lastName'),
      SystemLog.getLogStats('7d')
    ]);

    // Calculate total pending approvals
    const totalPendingApprovals = pendingEmployees + pendingPurchases + pendingVendors + pendingCustomers;

    // Get user role distribution
    const userRoleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly activity stats
    const monthlyStats = await SystemLog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        pendingApprovals: {
          total: totalPendingApprovals,
          employees: pendingEmployees,
          purchases: pendingPurchases,
          vendors: pendingVendors,
          customers: pendingCustomers
        },
        systemOverview: {
          totalUsers,
          totalEmployees,
          totalVendors,
          totalCustomers,
          totalPurchases,
          totalReports: systemStats.totalLogs || 0, // Using logs as reports for now
          userRoles: userRoleStats,
          ...systemStats
        },
        recentActivity: recentLogs,
        monthlyActivity: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error getting admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting admin dashboard data'
    });
  }
};

// Get all pending approvals
export const getPendingApprovals = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    let approvals = [];

    if (!type || type === 'all') {
      // Get all pending approvals
      const [employees, purchases, vendors, customers] = await Promise.all([
        Employee.find({ approvalStatus: 'Pending' })
          .select('firstName lastName email department designation createdAt')
          .sort({ createdAt: -1 }),
        PurchaseOrder.find({ approvalStatus: 'Pending' })
          .select('poNumber vendorName totalAmount orderDate createdAt')
          .sort({ createdAt: -1 }),
        Vendor.find({ approvalStatus: 'Pending' })
          .select('vendorName email contactPerson createdAt')
          .sort({ createdAt: -1 }),
        Customer.find({ approvalStatus: 'Pending' })
          .select('customerName email contactPerson createdAt')
          .sort({ createdAt: -1 })
      ]);

      // Combine and add type field
      approvals = [
        ...employees.map(item => ({ ...item.toObject(), type: 'employee' })),
        ...purchases.map(item => ({ ...item.toObject(), type: 'purchase' })),
        ...vendors.map(item => ({ ...item.toObject(), type: 'vendor' })),
        ...customers.map(item => ({ ...item.toObject(), type: 'customer' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Get specific type
      let Model;
      switch (type) {
        case 'employee':
          Model = Employee;
          break;
        case 'purchase':
          Model = PurchaseOrder;
          break;
        case 'vendor':
          Model = Vendor;
          break;
        case 'customer':
          Model = Customer;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid approval type'
          });
      }

      const items = await Model.find({ approvalStatus: 'Pending' })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Model.countDocuments({ approvalStatus: 'Pending' });

      approvals = items.map(item => ({ ...item.toObject(), type }));

      return res.json({
        success: true,
        data: {
          approvals,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        approvals,
        total: approvals.length
      }
    });
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting pending approvals'
    });
  }
};

// Approve an item
export const approveItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { notes } = req.body;

    let Model;
    let itemName;

    switch (type) {
      case 'employee':
        Model = Employee;
        itemName = 'Employee';
        break;
      case 'purchase':
        Model = PurchaseOrder;
        itemName = 'Purchase Order';
        break;
      case 'vendor':
        Model = Vendor;
        itemName = 'Vendor';
        break;
      case 'customer':
        Model = Customer;
        itemName = 'Customer';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid item type'
        });
    }

    const item = await Model.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${itemName} not found`
      });
    }

    if (item.approvalStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `${itemName} is not pending approval`
      });
    }

    // Update approval status
    item.approvalStatus = 'Approved';
    item.approvedBy = req.user._id;
    item.approverName = req.user.fullName;
    item.approvedAt = new Date();

    // For purchase orders, also update the main status
    if (type === 'purchase') {
      item.status = 'Approved';
    }

    await item.save();

    // Log the approval action
    await SystemLog.logAction({
      action: `${type.toUpperCase()}_APPROVE`,
      userId: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      targetType: itemName.replace(' ', ''),
      targetId: item._id,
      targetName: item.name || item.vendorName || item.customerName || item.poNumber || `${item.firstName} ${item.lastName}`,
      description: `Approved ${itemName.toLowerCase()}: ${item.name || item.vendorName || item.customerName || item.poNumber || `${item.firstName} ${item.lastName}`}${notes ? ` - ${notes}` : ''}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'SUCCESS',
      severity: 'HIGH'
    });

    res.json({
      success: true,
      message: `${itemName} approved successfully`,
      data: item
    });
  } catch (error) {
    console.error('Error approving item:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving item'
    });
  }
};

// Reject an item
export const rejectItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    let Model;
    let itemName;

    switch (type) {
      case 'employee':
        Model = Employee;
        itemName = 'Employee';
        break;
      case 'purchase':
        Model = PurchaseOrder;
        itemName = 'Purchase Order';
        break;
      case 'vendor':
        Model = Vendor;
        itemName = 'Vendor';
        break;
      case 'customer':
        Model = Customer;
        itemName = 'Customer';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid item type'
        });
    }

    const item = await Model.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${itemName} not found`
      });
    }

    if (item.approvalStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `${itemName} is not pending approval`
      });
    }

    // Update rejection status
    item.approvalStatus = 'Rejected';
    item.rejectedBy = req.user._id;
    item.rejectedAt = new Date();
    item.rejectionReason = reason;

    await item.save();

    // Log the rejection action
    await SystemLog.logAction({
      action: `${type.toUpperCase()}_REJECT`,
      userId: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      targetType: itemName.replace(' ', ''),
      targetId: item._id,
      targetName: item.name || item.vendorName || item.customerName || item.poNumber || `${item.firstName} ${item.lastName}`,
      description: `Rejected ${itemName.toLowerCase()}: ${item.name || item.vendorName || item.customerName || item.poNumber || `${item.firstName} ${item.lastName}`} - Reason: ${reason}${notes ? ` - ${notes}` : ''}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'SUCCESS',
      severity: 'HIGH'
    });

    res.json({
      success: true,
      message: `${itemName} rejected successfully`,
      data: item
    });
  } catch (error) {
    console.error('Error rejecting item:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting item'
    });
  }
};

// Get system logs
export const getSystemLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      targetType,
      status,
      severity,
      startDate,
      endDate,
      search
    } = req.query;

    const options = {
      page,
      limit,
      action,
      userId,
      targetType,
      status,
      severity,
      startDate,
      endDate,
      search
    };

    const result = await SystemLog.getLogs({}, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting system logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting system logs'
    });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;

    const stats = await SystemLog.getLogStats(timeframe);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting system statistics'
    });
  }
};

// Approve customer
export const approveCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.approvalStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Customer is not pending approval'
      });
    }

    // Update customer approval status
    customer.approvalStatus = 'Approved';
    customer.status = 'Registered';
    customer.approvedBy = req.user._id;
    customer.approverName = req.user.fullName || `${req.user.firstName} ${req.user.lastName}`;
    customer.approvedAt = new Date();

    if (comments) {
      customer.approvalComments = comments;
    }

    await customer.save();

    // Log the approval action
    await SystemLog.logAction({
      action: 'CUSTOMER_APPROVE',
      userId: req.user._id,
      userName: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
      userRole: req.user.role,
      targetType: 'Customer',
      targetId: customer._id,
      targetName: customer.customerName,
      description: `Approved customer: ${customer.customerName} (${customer.email})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'SUCCESS',
      severity: 'MEDIUM'
    });

    res.json({
      success: true,
      message: 'Customer approved successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error approving customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving customer',
      error: error.message
    });
  }
};

// Reject customer
export const rejectCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, comments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.approvalStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Customer is not pending approval'
      });
    }

    // Update customer rejection status
    customer.approvalStatus = 'Rejected';
    customer.status = 'Draft';
    customer.rejectedBy = req.user._id;
    customer.rejectedAt = new Date();
    customer.rejectionReason = reason;

    if (comments) {
      customer.rejectionComments = comments;
    }

    await customer.save();

    // Log the rejection action
    await SystemLog.logAction({
      action: 'CUSTOMER_REJECT',
      userId: req.user._id,
      userName: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
      userRole: req.user.role,
      targetType: 'Customer',
      targetId: customer._id,
      targetName: customer.customerName,
      description: `Rejected customer: ${customer.customerName} (${customer.email}) - Reason: ${reason}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'SUCCESS',
      severity: 'MEDIUM'
    });

    res.json({
      success: true,
      message: 'Customer rejected successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error rejecting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting customer',
      error: error.message
    });
  }
};

// Get pending customers for approval
export const getPendingCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = ''
    } = req.query;

    // Build filter object
    const filter = { approvalStatus: 'Pending' };

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Customer.countDocuments(filter);
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          current: parseInt(page),
          pages,
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting pending customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting pending customers',
      error: error.message
    });
  }
};
