  // agri-drone-accounts/server/controllers/vendorController.js
  import Vendor from '../models/Vendor.js';
  import OTP from '../models/OTP.js';
  import { sendOTPEmail, sendWelcomeEmail } from '../services/emailService.js';

  import mongoose from 'mongoose';

  // Get all vendors with filtering and pagination
  export const getVendors = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // MongoDB logic - REAL DATABASE PERSISTENCE ONLY
      const filter = {};

      if (type) filter.vendorType = type;
      if (status) filter.status = status;

      if (search) {
        filter.$or = [
          { vendorName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
          { gstNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const vendors = await Vendor.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v');

      const total = await Vendor.countDocuments(filter);

      res.json({
        success: true,
        data: vendors,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendors',
        error: error.message
      });
    }
  };

  // Send OTP for vendor registration
  export const sendOTP = async (req, res) => {
    try {
      const { email, purpose = 'vendor_registration' } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if vendor already exists (only for new registration)
      if (purpose === 'vendor_registration') {
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
          // Allow OTP for existing vendors (they might want to update info)
          console.log('Sending OTP to existing vendor for verification');
        }
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete any existing OTP for this email and purpose
      await OTP.deleteMany({ email, purpose });

      // Create new OTP record
      const otp = new OTP({
        email,
        otp: otpCode,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      await otp.save();

      // Send OTP email
      const emailResult = await sendOTPEmail(email, otpCode, purpose);

      console.log('📧 OTP Email sent successfully:', emailResult.messageId);
      if (emailResult.previewUrl) {
        console.log('📧 Preview URL:', emailResult.previewUrl);
      }

      res.json({
        success: true,
        message: emailResult.realEmail ?
          'OTP sent successfully to your email' :
          'Test OTP sent (check server logs for preview URL)',
        data: {
          email,
          expiresIn: '10 minutes',
          previewUrl: emailResult.previewUrl, // For testing with Ethereal Email
          realEmail: emailResult.realEmail
        }
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending OTP',
        error: error.message
      });
    }
  };

  // Verify OTP
  export const verifyOTP = async (req, res) => {
    try {
      const { email, otp, purpose = 'vendor_registration' } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
      }



      // Find the OTP record
      const otpRecord = await OTP.findOne({
        email,
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

      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Create new vendor
  export const createVendor = async (req, res) => {
    try {
      const vendorData = req.body;

      // Validate required fields
      const requiredFields = [
        'vendorName', 'legalStructure', 'businessType', 'vendorType',
        'email', 'phoneNumber', 'address', 'city', 'state', 'pincode',
        'bankName', 'branchName', 'accountNumber', 'accountHolderName',
        'undertakingName', 'undertakingEmail'
      ];

      for (const field of requiredFields) {
        if (!vendorData[field]) {
          console.log("missing fields:", field);
          return res.status(400).json({
            success: false,
            message: `${field} is required`
          });
        }
      }

      // Check if vendor already exists
      const existingVendor = await Vendor.findOne({
        $or: [
          { email: vendorData.email },
          { gstNumber: vendorData.gstNumber },
          { panNumber: vendorData.panNumber }
        ]
      });

      // if (existingVendor) {
      //   console.log("the vendor already existed");
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Vendor with this email, GST, or PAN already exists'
      //   });
      // }

      // Clean up the vendor data
      const cleanedVendorData = { ...vendorData };

      // Handle signature field - convert empty object to null
      if (cleanedVendorData.signature && typeof cleanedVendorData.signature === 'object' && Object.keys(cleanedVendorData.signature).length === 0) {
        cleanedVendorData.signature = null;
      }

      // Create new vendor
      const newVendor = new Vendor({
        ...cleanedVendorData,
        status: 'Active',
        isVerified: true,
        verificationDate: new Date()
      });

      await newVendor.save();

      // Send welcome email
      try {
        await sendWelcomeEmail(newVendor);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Don't fail the registration if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: newVendor
      });
    } catch (error) {
      console.error('Error creating vendor:', error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating vendor',
        error: error.message
      });
    }
  };

  // Get vendor by ID with related data
  export const getVendorById = async (req, res) => {
    try {
      const { id } = req.params;
      const { includeOrders = 'true', includeProducts = 'true' } = req.query;

      const vendor = await Vendor.findById(id).select('-__v');

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      const vendorData = vendor.toObject();

      // Include recent orders if requested
      if (includeOrders === 'true') {
        try {
          vendorData.recentOrders = await vendor.getRecentOrders(5);
          vendorData.statistics = await vendor.getStatistics();
        } catch (orderError) {
          console.warn('Error fetching vendor orders:', orderError);
          vendorData.recentOrders = [];
          vendorData.statistics = {
            totalOrders: 0,
            totalValue: 0,
            completedOrders: 0,
            averageOrderValue: 0,
            lastOrderDate: null
          };
        }
      }

      // Include supplied products if requested
      if (includeProducts === 'true') {
        try {
          vendorData.suppliedProducts = await vendor.getSuppliedProducts();
        } catch (productError) {
          console.warn('Error fetching vendor products:', productError);
          vendorData.suppliedProducts = [];
        }
      }

      res.json({
        success: true,
        data: vendorData
      });
    } catch (error) {
      console.error('Error fetching vendor:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendor',
        error: error.message
      });
    }
  };

  // Update vendor
  export const updateVendor = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.__v;
      delete updateData.createdAt;

      // Add updated timestamp
      updateData.updatedBy = req.user?.name || 'System';

      const vendor = await Vendor.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
          select: '-__v'
        }
      );

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      res.json({
        success: true,
        message: 'Vendor updated successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Error updating vendor:', error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating vendor',
        error: error.message
      });
    }
  };

  // Delete vendor (soft delete by changing status)
  export const deleteVendor = async (req, res) => {
    try {
      const { id } = req.params;

      const vendor = await Vendor.findByIdAndUpdate(
        id,
        {
          status: 'Inactive',
          updatedBy: req.user?.name || 'System'
        },
        { new: true, select: '-__v' }
      );

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      res.json({
        success: true,
        message: 'Vendor deleted successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting vendor',
        error: error.message
      });
    }
  };

  // Get vendors by type
  export const getVendorsByType = async (req, res) => {
    try {
      const { type } = req.params;

      if (!['Local', 'National', 'International'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vendor type'
        });
      }

      const vendors = await Vendor.getByType(type).select('-__v');

      res.json({
        success: true,
        data: vendors,
        total: vendors.length
      });
    } catch (error) {
      console.error('Error fetching vendors by type:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendors by type',
        error: error.message
      });
    }
  };

  // Activate vendor
  export const activateVendor = async (req, res) => {
    try {
      const { id } = req.params;

      const vendor = await Vendor.findById(id);

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      await vendor.activate();

      res.json({
        success: true,
        message: 'Vendor activated successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Error activating vendor:', error);
      res.status(500).json({
        success: false,
        message: 'Error activating vendor',
        error: error.message
      });
    }
  };

  // Deactivate vendor
  export const deactivateVendor = async (req, res) => {
    try {
      const { id } = req.params;

      const vendor = await Vendor.findById(id);

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      await vendor.deactivate();

      res.json({
        success: true,
        message: 'Vendor deactivated successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Error deactivating vendor:', error);
      res.status(500).json({
        success: false,
        message: 'Error deactivating vendor',
        error: error.message
      });
    }
  };
