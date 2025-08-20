// agri-drone-accounts/server/models/Procurement.js
import mongoose from 'mongoose';

const procurementItemSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  
  productDetails: {
    type: String,
    required: [true, 'Product details are required'],
    trim: true,
    maxlength: [1000, 'Product details cannot exceed 1000 characters']
  },
  
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: [0, 'Unit cost cannot be negative']
  },
  
  tax: {
    type: Number,
    required: [true, 'Tax amount is required'],
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: [0, 'Total cost cannot be negative']
  }
}, {
  _id: true
});

const procurementSchema = new mongoose.Schema({
  // Employee Information
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  
  employeeCode: {
    type: String,
    required: [true, 'Employee code is required'],
    trim: true,
    uppercase: true
  },
  
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['RnD', 'Production', 'Flight Lab', 'Store', 'QC']
  },
  
  // Procurement Information
  procurementId: {
    type: String,
    required: [true, 'Procurement ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  requestDate: {
    type: Date,
    required: [true, 'Request date is required'],
    default: Date.now
  },
  
  items: [procurementItemSchema],
  
  // Calculated Totals
  totalProducts: {
    type: Number,
    required: [true, 'Total products count is required'],
    min: [1, 'Must have at least 1 product']
  },
  
  totalQuantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [1, 'Total quantity must be at least 1']
  },
  
  totalUnitCost: {
    type: Number,
    required: [true, 'Total unit cost is required'],
    min: [0, 'Total unit cost cannot be negative']
  },
  
  totalTax: {
    type: Number,
    required: [true, 'Total tax is required'],
    min: [0, 'Total tax cannot be negative']
  },
  
  grandTotal: {
    type: Number,
    required: [true, 'Grand total is required'],
    min: [0, 'Grand total cannot be negative']
  },
  
  // Status and Approval
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  
  approvedDate: {
    type: Date
  },
  
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  
  // Additional Information
  purpose: {
    type: String,
    trim: true,
    maxlength: [1000, 'Purpose cannot exceed 1000 characters']
  },
  
  urgencyReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Urgency reason cannot exceed 500 characters']
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Audit Information
  createdBy: {
    type: String,
    default: 'System'
  },
  
  updatedBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
procurementSchema.index({ employeeId: 1 });
procurementSchema.index({ procurementId: 1 });
procurementSchema.index({ status: 1 });
procurementSchema.index({ requestDate: -1 });
procurementSchema.index({ department: 1 });

// Virtual for formatted request date
procurementSchema.virtual('formattedRequestDate').get(function() {
  return this.requestDate.toLocaleDateString();
});

// Virtual for days since request
procurementSchema.virtual('daysSinceRequest').get(function() {
  const today = new Date();
  const diffTime = today - this.requestDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to generate procurement ID
procurementSchema.statics.generateProcurementId = async function() {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  return `PROC-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Static method to get procurements by employee
procurementSchema.statics.getProcurementsByEmployee = function(employeeId) {
  return this.find({ employeeId })
    .populate('employeeId', 'employeeName employeeCode department')
    .sort({ requestDate: -1 });
};

// Static method to get procurements by status
procurementSchema.statics.getProcurementsByStatus = function(status) {
  return this.find({ status })
    .populate('employeeId', 'employeeName employeeCode department')
    .sort({ requestDate: -1 });
};

// Instance method to calculate totals
procurementSchema.methods.calculateTotals = function() {
  this.totalProducts = this.items.length;
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalUnitCost = this.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  this.totalTax = this.items.reduce((sum, item) => sum + item.tax, 0);
  this.grandTotal = this.totalUnitCost + this.totalTax;
  return this;
};

// Pre-save middleware to calculate totals
procurementSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

const Procurement = mongoose.model('Procurement', procurementSchema);

export default Procurement;
