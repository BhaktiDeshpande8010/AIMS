import Employee from '../models/Employee.js';
import Procurement from '../models/Procurement.js';
import SystemLog from '../models/SystemLog.js';
import mongoose from 'mongoose';

export const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, status } = req.query;

    // Build filter object
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch employees with pagination
    const employees = await Employee.find(filter)
      .select('-bankDetails -panNumber -aadharNumber') // Exclude sensitive data
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Employee.countDocuments(filter);

    res.json({
      success: true,
      data: employees,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get procurement requests for this employee
    const procurementRequests = await Procurement.find({ employeeId: id })
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      data: {
        ...employee.toObject(),
        procurementRequests
      }
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    // Generate employee ID if not provided
    if (!employeeData.employeeId) {
      const count = await Employee.countDocuments();
      employeeData.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
    }

    // Create new employee with approval workflow
    const employee = new Employee({
      ...employeeData,
      // All employees require admin approval
      approvalStatus: 'Pending',
      requiresApproval: true,
      createdBy: req.user?.fullName || 'System'
    });

    await employee.save();

    // Log the creation action
    await SystemLog.logAction({
      action: 'EMPLOYEE_CREATE',
      userId: req.user?._id || null,
      userName: req.user?.fullName || 'System',
      userRole: req.user?.role || 'system',
      targetType: 'Employee',
      targetId: employee._id,
      targetName: `${employee.firstName} ${employee.lastName}`,
      description: `Created new employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'SUCCESS',
      severity: 'MEDIUM'
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully and sent for admin approval',
      data: employee
    });
  } catch (error) {
    console.error('Error creating employee:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
};

export const createProcurementRequest = async (req, res) => {
  try {
    const { id: employeeId } = req.params;
    const procurementData = req.body;



    // Validate employee exists
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Generate procurement ID
    const procurementId = await Procurement.generateProcurementId();

    // Create procurement request
    const procurement = new Procurement({
      ...procurementData,
      employeeId: employee._id,
      employeeName: employee.employeeName,
      employeeCode: employee.employeeId,
      department: employee.department,
      procurementId,
      createdBy: req.user?.name || 'System'
    });

    await procurement.save();

    res.status(201).json({
      success: true,
      message: 'Procurement request created successfully',
      data: procurement
    });
  } catch (error) {
    console.error('Error creating procurement request:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating procurement request',
      error: error.message
    });
  }
};
