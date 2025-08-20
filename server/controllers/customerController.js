// agri-drone-accounts/server/controllers/customerController.js
import Customer from '../models/Customer.js';
import OTP from '../models/OTP.js';
import SystemLog from '../models/SystemLog.js';
import { sendOTPEmail } from '../services/emailService.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Get all customers with pagination and filtering
const getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      customerType = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (customerType) {
      filter.customerType = customerType;
    }

    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const customers = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Customer.countDocuments(filter);
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: customers,
      pagination: {
        current: parseInt(page),
        pages,
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Create new Individual Customer with file uploads
const createIndividualCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    const files = req.files;

    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({
      email: customerData.email.toLowerCase()
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Handle file uploads
    const uploadedFiles = {};
    if (files) {
      if (files.aadhaarPhoto) {
        uploadedFiles.aadhaarPhoto = files.aadhaarPhoto[0].path;
      }
      if (files.panPhoto) {
        uploadedFiles.panPhoto = files.panPhoto[0].path;
      }
      if (files.customerPhoto) {
        uploadedFiles.customerPhoto = files.customerPhoto[0].path;
      }
    }

    // Prepare bank details object
    const bankDetails = {
      bankName: customerData.bankName,
      accountNumber: customerData.accountNumber,
      ifscCode: customerData.ifscCode.toUpperCase()
    };

    // Create new Individual customer with approval workflow
    const customer = new Customer({
      ...customerData,
      ...uploadedFiles,
      bankDetails,
      customerType: 'Individual',
      approvalStatus: 'Pending',
      status: 'Draft',
      requiresApproval: true,
      createdBy: req.user?.fullName || req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'Public Registration'
    });

    await customer.save();

    // Log the creation action
    try {
      await SystemLog.logAction({
        action: 'CUSTOMER_CREATE',
        userId: req.user?._id || null,
        userName: req.user?.fullName || req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'Public User',
        userRole: req.user?.role || 'public',
        targetType: 'Customer',
        targetId: customer._id,
        targetName: customer.customerName,
        description: `Created new individual customer: ${customer.customerName} (${customer.email})`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'SUCCESS',
        severity: 'MEDIUM'
      });
    } catch (logError) {
      console.warn('Failed to log customer creation:', logError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Individual customer created successfully and sent for admin approval',
      data: customer
    });
  } catch (error) {
    console.error('Error creating individual customer:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating individual customer',
      error: error.message
    });
  }
};

// Create new customer (general)
const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({
      email: customerData.email.toLowerCase()
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Create new customer
    const customer = new Customer({
      ...customerData,
      createdBy: req.user?.fullName || 'System'
    });

    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findById(id).select('-__v');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: req.user?.name || 'System'
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-__v');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    // Soft delete by setting status to inactive
    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        status: 'Inactive',
        updatedBy: req.user?.name || 'System'
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

// Send OTP for customer registration
const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, purpose = 'customer_registration' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate phone number format
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this phone number and purpose
    await OTP.deleteMany({ phoneNumber, purpose });

    // Create new OTP record
    const otp = new OTP({
      phoneNumber,
      otp: otpCode,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await otp.save();

    // For development, log the OTP instead of sending SMS
    console.log('📱 Customer OTP (Development Mode):');
    console.log(`   Phone: ${phoneNumber}`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`   OTP Code: ${otpCode}`);
    console.log(`   Valid for: 10 minutes`);
    console.log('   ⚠️  In production, this would be sent via SMS');

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully (Development Mode - Check server logs)',
      developmentMode: true,
      otp: otpCode // Include OTP in response for development
    });

  } catch (error) {
    console.error('Error sending customer OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
};

// Verify OTP for customer registration
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp, purpose = 'customer_registration' } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      phoneNumber,
      otp,
      purpose,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Delete the OTP record after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Error verifying customer OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
};

// Generate customer receipt (PDF)
const generateCustomerReceipt = async (req, res) => {
  try {
    const { id } = req.params;

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

    if (customer.approvalStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Receipt can only be generated for approved customers'
      });
    }

    // Generate receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Customer Registration Receipt</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .customer-photo { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin: 10px auto; display: block; }
          .section { margin-bottom: 25px; }
          .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 15px; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; }
          .info-row:nth-child(even) { background-color: #f9f9f9; padding: 8px; border-radius: 4px; }
          .masked { font-family: 'Courier New', monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
          .price-section { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .total-price { font-size: 20px; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; margin-top: 10px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; border-top: 1px solid #ccc; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🚁 Agri-Drone Systems</div>
          <h1>Customer Registration Receipt</h1>
          <p><strong>Registration Date:</strong> ${new Date(customer.createdAt).toLocaleDateString('en-IN')}</p>
          <p><strong>Receipt ID:</strong> ${customer._id}</p>
        </div>

        <div class="section">
          <h3>👤 Customer Information</h3>
          ${customer.customerPhoto ? `<img src="${customer.customerPhoto}" alt="Customer Photo" class="customer-photo">` : ''}
          <div class="info-row"><span><strong>Name:</strong></span><span>${customer.customerName}</span></div>
          <div class="info-row"><span><strong>Email:</strong></span><span>${customer.email}</span></div>
          <div class="info-row"><span><strong>Phone:</strong></span><span>${customer.phoneNumber}</span></div>
          <div class="info-row"><span><strong>Type:</strong></span><span>${customer.customerType}</span></div>
          <div class="info-row"><span><strong>Address:</strong></span><span>${customer.detailedAddress}</span></div>
        </div>

        <div class="section">
          <h3>🔐 Verification Documents</h3>
          <div class="info-row"><span><strong>Aadhaar Number:</strong></span><span class="masked">****-****-${customer.aadhaarNumber ? customer.aadhaarNumber.slice(-4) : '****'}</span></div>
          <div class="info-row"><span><strong>PAN Number:</strong></span><span class="masked">*****${customer.panNumber ? customer.panNumber.slice(-5) : '*****'}</span></div>
          <div class="info-row"><span><strong>Documents:</strong></span><span>✅ Aadhaar & PAN Verified</span></div>
        </div>

        <div class="section">
          <h3>📦 Product Details</h3>
          <div class="info-row"><span><strong>Selected Product:</strong></span><span>${customer.selectedProduct}</span></div>
          <div class="price-section">
            <div class="info-row"><span><strong>Base Price:</strong></span><span>₹${customer.basePrice?.toLocaleString('en-IN')}</span></div>
            <div class="info-row"><span><strong>GST (${customer.gstPercentage}%):</strong></span><span>₹${customer.gstAmount?.toLocaleString('en-IN')}</span></div>
            <div class="info-row total-price"><span><strong>Final Price:</strong></span><span>₹${customer.finalPrice?.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div class="section">
          <h3>🏦 Bank Reference</h3>
          <div class="info-row"><span><strong>Bank Name:</strong></span><span>${customer.bankDetails?.bankName}</span></div>
          <div class="info-row"><span><strong>Account Number:</strong></span><span class="masked">****${customer.bankDetails?.accountNumber ? customer.bankDetails.accountNumber.slice(-4) : '****'}</span></div>
          <div class="info-row"><span><strong>IFSC Code:</strong></span><span>${customer.bankDetails?.ifscCode}</span></div>
        </div>

        <div class="section">
          <h3>✅ Approval Details</h3>
          <div class="info-row"><span><strong>Status:</strong></span><span style="color: #16a34a; font-weight: bold;">${customer.status}</span></div>
          <div class="info-row"><span><strong>Approved By:</strong></span><span>${customer.approverName || 'System Admin'}</span></div>
          <div class="info-row"><span><strong>Approved Date:</strong></span><span>${customer.approvedAt ? new Date(customer.approvedAt).toLocaleDateString('en-IN') : 'N/A'}</span></div>
        </div>

        <div class="footer">
          <p><strong>This is a computer-generated receipt and does not require a signature.</strong></p>
          <p>For any queries, please contact our support team at support@agridrone.com</p>
          <p>© ${new Date().getFullYear()} Agri-Drone Systems. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Set response headers for HTML download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="customer-receipt-${customer.customerName.replace(/\s+/g, '-')}-${customer._id}.html"`);

    res.send(receiptHTML);

  } catch (error) {
    console.error('Error generating customer receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating customer receipt',
      error: error.message
    });
  }
};

// Create new Organizational Customer with file uploads
const createOrganizationalCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    const files = req.files;

    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({
      email: customerData.email.toLowerCase()
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Handle file uploads
    const uploadedFiles = {};
    if (files && files.organizationPhoto) {
      uploadedFiles.organizationPhoto = files.organizationPhoto[0].path;
    }

    // Prepare bank details object
    const bankDetails = {
      bankName: customerData.bankName,
      accountNumber: customerData.accountNumber,
      ifscCode: customerData.ifscCode.toUpperCase()
    };

    // Create new Organizational customer with approval workflow
    const customer = new Customer({
      ...customerData,
      ...uploadedFiles,
      bankDetails,
      customerType: customerData.customerType || 'Business',
      approvalStatus: 'Pending',
      status: 'Draft',
      requiresApproval: true,
      createdBy: req.user?.fullName || req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'Public Registration'
    });

    await customer.save();

    // Log the creation action
    try {
      await SystemLog.logAction({
        action: 'CUSTOMER_CREATE',
        userId: req.user?._id || null,
        userName: req.user?.fullName || req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'Public User',
        userRole: req.user?.role || 'public',
        targetType: 'Customer',
        targetId: customer._id,
        targetName: customer.customerName,
        description: `Created new organizational customer: ${customer.customerName} (${customer.email})`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'SUCCESS',
        severity: 'MEDIUM'
      });
    } catch (logError) {
      console.warn('Failed to log customer creation:', logError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Organizational customer created successfully and sent for admin approval',
      data: customer
    });
  } catch (error) {
    console.error('Error creating organizational customer:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating organizational customer',
      error: error.message
    });
  }
};

export {
  getCustomers,
  createCustomer,
  createIndividualCustomer,
  createOrganizationalCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  sendOTP,
  verifyOTP,
  generateCustomerReceipt
};
