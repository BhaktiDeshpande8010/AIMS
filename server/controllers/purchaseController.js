// agri-drone-accounts/server/controllers/purchaseController.js
import PurchaseOrder from '../models/PurchaseOrder.js';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import pdfService from '../services/pdfService.js';
import { getFileInfo, deleteFile } from '../middleware/fileUpload.js';
import SystemLog from '../models/SystemLog.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Get all purchase orders with pagination and filtering
export const getPurchases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      vendorId = '',
      sortBy = 'orderDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { poNumber: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (vendorId) {
      filter.vendorId = vendorId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const purchases = await PurchaseOrder.find(filter)
      .populate('vendorId', 'vendorName email phoneNumber')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await PurchaseOrder.countDocuments(filter);
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      purchases: purchases,
      pagination: {
        current: parseInt(page),
        pages,
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases',
      error: error.message
    });
  }
};

// Create new purchase order with file upload support
export const createPurchase = async (req, res) => {
  try {
    let purchaseData = { ...req.body };

    // Parse JSON fields if they come as strings (from FormData)
    if (typeof purchaseData.deliveryAddress === 'string') {
      try {
        purchaseData.deliveryAddress = JSON.parse(purchaseData.deliveryAddress);
      } catch (e) {
        console.error('Error parsing deliveryAddress:', e);
      }
    }

    if (typeof purchaseData.items === 'string') {
      try {
        purchaseData.items = JSON.parse(purchaseData.items);
      } catch (e) {
        console.error('Error parsing items:', e);
      }
    }

    // Handle file uploads
    const quotationFile = req.files?.quotationFile?.[0];
    const invoiceFile = req.files?.invoiceFile?.[0];

    console.log('Purchase data received:', purchaseData);
    console.log('Files received:', { quotationFile: !!quotationFile, invoiceFile: !!invoiceFile });

    // Find vendor by ID or name
    let vendor = null;

    if (purchaseData.vendorId) {
      // If vendorId is provided, find by ID
      vendor = await Vendor.findById(purchaseData.vendorId);
    } else if (purchaseData.vendorName) {
      // If only vendorName is provided, find by name
      vendor = await Vendor.findOne({ vendorName: purchaseData.vendorName });
    }

    if (!vendor && purchaseData.vendorName) {
      // Create a basic vendor if it doesn't exist
      try {
        vendor = new Vendor({
          vendorName: purchaseData.vendorName,
          vendorType: 'Local',
          contactPerson: 'N/A',
          email: `${purchaseData.vendorName.toLowerCase().replace(/\s+/g, '')}@vendor.com`,
          mobile: '0000000000',
          address: {
            street: 'N/A',
            city: 'N/A',
            state: 'N/A',
            pincode: '000000',
            country: 'India'
          },
          bankDetails: {
            bankName: 'N/A',
            accountNumber: 'N/A',
            ifscCode: 'N/A',
            accountHolderName: purchaseData.vendorName
          }
        });
        await vendor.save();
        console.log('Created new vendor:', vendor.vendorName);
      } catch (vendorError) {
        console.error('Error creating vendor:', vendorError);
        // Clean up uploaded files
        if (quotationFile) deleteFile(quotationFile.path);
        if (invoiceFile) deleteFile(invoiceFile.path);

        return res.status(400).json({
          success: false,
          message: 'Error creating vendor: ' + vendorError.message
        });
      }
    }

    if (!vendor) {
      // Clean up uploaded files if vendor still not found
      if (quotationFile) deleteFile(quotationFile.path);
      if (invoiceFile) deleteFile(invoiceFile.path);

      return res.status(400).json({
        success: false,
        message: 'Vendor name is required'
      });
    }

    // Generate PO number if not provided
    if (!purchaseData.poNumber) {
      const count = await PurchaseOrder.countDocuments();
      purchaseData.poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    // Prepare purchase order data
    const purchaseOrderData = {
      ...purchaseData,
      vendorId: vendor._id,
      vendorName: vendor.vendorName,
      createdBy: req.user?.name || 'System'
    };

    // Add file information if files were uploaded
    if (quotationFile) {
      purchaseOrderData.quotationFile = getFileInfo(quotationFile);
    }

    if (invoiceFile) {
      purchaseOrderData.invoiceFile = getFileInfo(invoiceFile);
    }

    // Create new purchase order with approval workflow
    const purchase = new PurchaseOrder({
      ...purchaseOrderData,
      // All purchase orders require admin approval
      approvalStatus: 'Pending',
      status: 'Draft', // Keep as draft until approved
      requiresApproval: true
    });

    await purchase.save();

    // Update vendor statistics
    await vendor.updateOrderStats(purchase.totalAmount, purchase.orderDate);

    // Log the creation action
    await SystemLog.logAction({
      action: 'PURCHASE_CREATE',
      userId: req.user?._id || null,
      userName: req.user?.fullName || 'System',
      userRole: req.user?.role || 'system',
      targetType: 'PurchaseOrder',
      targetId: purchase._id,
      targetName: purchase.poNumber,
      description: `Created new purchase order: ${purchase.poNumber} for vendor: ${purchase.vendorName}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'SUCCESS',
      severity: 'MEDIUM'
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully and sent for admin approval',
      data: purchase
    });
  } catch (error) {
    console.error('Error creating purchase:', error);

    // Clean up uploaded files on error
    if (req.files?.quotationFile?.[0]) {
      deleteFile(req.files.quotationFile[0].path);
    }
    if (req.files?.invoiceFile?.[0]) {
      deleteFile(req.files.invoiceFile[0].path);
    }

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
        message: 'Purchase order with this PO number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating purchase order',
      error: error.message
    });
  }
};

// Get purchase order by ID
export const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const purchase = await PurchaseOrder.findById(id)
      .populate('vendorId', 'vendorName email phoneNumber address city state pincode gstNumber')
      .select('-__v');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase order',
      error: error.message
    });
  }
};

// Update purchase order
export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const purchase = await PurchaseOrder.findByIdAndUpdate(
      id,
      {
        ...updateData,
        lastModifiedBy: req.user?.name || 'System'
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-__v');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    res.json({
      success: true,
      message: 'Purchase order updated successfully',
      data: purchase
    });
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating purchase order',
      error: error.message
    });
  }
};

// Delete purchase order
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    // Soft delete by setting status to cancelled
    const purchase = await PurchaseOrder.findByIdAndUpdate(
      id,
      {
        status: 'Cancelled',
        lastModifiedBy: req.user?.name || 'System'
      },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    res.json({
      success: true,
      message: 'Purchase order cancelled successfully'
    });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling purchase order',
      error: error.message
    });
  }
};

// Generate Invoice PDF
export const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const purchase = await PurchaseOrder.findById(id)
      .populate('vendorId', 'vendorName email phoneNumber address city state pincode gstNumber');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // Generate invoice data
    const invoiceData = purchase.generateInvoiceData();
    invoiceData.customer = {
      name: 'Agri-Drone Solutions Pvt Ltd',
      address: '123 Tech Park, Electronic City',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560100',
      gstNumber: '29AABCA1234C1Z5'
    };

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'invoices');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename
    const filename = pdfService.generateFilename(`invoice_${purchase.poNumber}`);
    const filePath = path.join(uploadsDir, filename);

    // Generate PDF
    await pdfService.generateInvoice(invoiceData, filePath);

    // Update purchase order with invoice number
    if (!purchase.invoiceNumber) {
      purchase.invoiceNumber = invoiceData.invoiceNumber;
      await purchase.save();
    }

    res.json({
      success: true,
      message: 'Invoice generated successfully',
      data: {
        filename,
        downloadUrl: `/api/purchases/${id}/download-invoice`,
        invoiceNumber: invoiceData.invoiceNumber
      }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice',
      error: error.message
    });
  }
};

// Generate Bill PDF
export const generateBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const purchase = await PurchaseOrder.findById(id)
      .populate('vendorId', 'vendorName email phoneNumber address city state pincode gstNumber');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // Generate bill data
    const billData = purchase.generateBillData();
    billData.vendor = purchase.vendorId || {
      name: purchase.vendorName,
      address: 'Vendor Address',
      city: 'City',
      state: 'State',
      pincode: '000000'
    };

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'bills');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename
    const filename = pdfService.generateFilename(`bill_${purchase.poNumber}`);
    const filePath = path.join(uploadsDir, filename);

    // Generate PDF
    await pdfService.generateBill(billData, filePath);

    res.json({
      success: true,
      message: 'Bill generated successfully',
      data: {
        filename,
        downloadUrl: `/api/purchases/${id}/download-bill`,
        billNumber: billData.billNumber
      }
    });
  } catch (error) {
    console.error('Error generating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating bill',
      error: error.message
    });
  }
};

// Download Invoice PDF
export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await PurchaseOrder.findById(id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
    const files = fs.readdirSync(invoicesDir).filter(file =>
      file.includes(`invoice_${purchase.poNumber}`) && file.endsWith('.pdf')
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice file not found. Please generate invoice first.'
      });
    }

    const filePath = path.join(invoicesDir, files[0]);
    const filename = `Invoice_${purchase.poNumber}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading invoice',
      error: error.message
    });
  }
};

// Workflow automation endpoints

// Approve purchase order
export const approvePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { approverName, approverRole, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const purchase = await PurchaseOrder.findById(id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    await purchase.approve(approverName, approverRole, notes);

    res.json({
      success: true,
      message: 'Purchase order approved successfully',
      data: purchase
    });
  } catch (error) {
    console.error('Error approving purchase:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mark purchase as delivered
export const markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryDate, notes } = req.body;
    const updatedBy = req.user?.name || 'System';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const purchase = await PurchaseOrder.findById(id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    await purchase.markDelivered(updatedBy, deliveryDate ? new Date(deliveryDate) : null, notes);

    res.json({
      success: true,
      message: 'Purchase order marked as delivered successfully',
      data: purchase
    });
  } catch (error) {
    console.error('Error marking purchase as delivered:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mark purchase as invoiced (with file upload)
export const markInvoiced = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const updatedBy = req.user?.name || 'System';
    const invoiceFile = req.file;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const purchase = await PurchaseOrder.findById(id);
    if (!purchase) {
      if (invoiceFile) deleteFile(invoiceFile.path);
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    const fileInfo = invoiceFile ? getFileInfo(invoiceFile) : null;
    await purchase.markInvoiced(updatedBy, fileInfo, notes);

    res.json({
      success: true,
      message: 'Purchase order marked as invoiced successfully',
      data: purchase
    });
  } catch (error) {
    console.error('Error marking purchase as invoiced:', error);
    if (req.file) deleteFile(req.file.path);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mark purchase as paid
export const markPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate, notes } = req.body;
    const updatedBy = req.user?.name || 'System';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const purchase = await PurchaseOrder.findById(id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    await purchase.markPaid(updatedBy, paymentDate ? new Date(paymentDate) : null, notes);

    res.json({
      success: true,
      message: 'Purchase order marked as paid successfully',
      data: purchase
    });
  } catch (error) {
    console.error('Error marking purchase as paid:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Reject purchase order
export const rejectPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectedBy, reason, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID'
      });
    }

    const purchase = await PurchaseOrder.findById(id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    await purchase.reject(rejectedBy, reason, notes);

    res.json({
      success: true,
      message: 'Purchase order rejected successfully',
      data: purchase
    });
  } catch (error) {
    console.error('Error rejecting purchase:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await PurchaseOrder.getDashboardStats();
    const result = stats[0] || {
      totalPurchases: 0,
      totalPurchaseValue: 0,
      pendingPayments: 0,
      draftOrders: 0,
      approvedOrders: 0,
      deliveredOrders: 0,
      invoicedOrders: 0,
      paidOrders: 0
    };

    // Calculate pending requests (draft + approved orders)
    result.pendingRequests = result.draftOrders + result.approvedOrders;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting dashboard statistics',
      error: error.message
    });
  }
};

// Download Bill PDF
export const downloadBill = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await PurchaseOrder.findById(id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    const billsDir = path.join(process.cwd(), 'uploads', 'bills');
    const files = fs.readdirSync(billsDir).filter(file =>
      file.includes(`bill_${purchase.poNumber}`) && file.endsWith('.pdf')
    );

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill file not found. Please generate bill first.'
      });
    }

    const filePath = path.join(billsDir, files[0]);
    const filename = `Bill_${purchase.poNumber}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading bill',
      error: error.message
    });
  }
};

// Get purchase statistics
export const getPurchaseStats = async (req, res) => {
  try {
    const stats = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalValue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      averageOrderValue: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching purchase statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase statistics',
      error: error.message
    });
  }
};
