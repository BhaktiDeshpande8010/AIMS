import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema({
  // Order Identification
  poNumber: {
    type: String,
    required: [true, 'PO number is required'],
    unique: true,
    trim: true
  },
  
  // Vendor Information
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  
  vendorName: {
    type: String,
    required: [true, 'Vendor name is required']
  },

  // Order Details
  orderDate: {
    type: Date,
    required: [true, 'Order date is required'],
    default: Date.now
  },
  
  expectedDeliveryDate: {
    type: Date,
    required: [true, 'Expected delivery date is required']
  },
  
  actualDeliveryDate: {
    type: Date
  },

  // Items in the order
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: {
      type: String,
      required: [true, 'Product name is required']
    },
    description: {
      type: String,
      required: [true, 'Product description is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitOfMeasure: {
      type: String,
      required: [true, 'Unit of measure is required'],
      enum: ['pcs', 'kg', 'grams', 'meters', 'cm', 'mm', 'liters', 'ml', 'boxes', 'sets', 'pairs', 'dozens', 'units'],
      default: 'pcs'
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    specifications: {
      type: String
    },
    hsnCode: {
      type: String,
      trim: true,
      maxlength: [20, 'HSN code cannot exceed 20 characters']
    },
    taxRate: {
      type: Number,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
      default: 18
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    }
  }],

  // Financial Information
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },

  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },

  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },

  shippingCharges: {
    type: Number,
    default: 0,
    min: [0, 'Shipping charges cannot be negative']
  },

  otherCharges: {
    type: Number,
    default: 0,
    min: [0, 'Other charges cannot be negative']
  },

  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
    default: 'INR'
  },

  // Status and Tracking - Updated Workflow
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Draft', 'Approved', 'Delivered', 'Invoiced', 'Paid', 'Cancelled'],
    default: 'Draft'
  },

  // Workflow tracking
  workflowHistory: [{
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Delivered', 'Invoiced', 'Paid', 'Cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      maxlength: [500, 'Workflow notes cannot exceed 500 characters']
    }
  }],

  // Enhanced Purchase Registration Fields
  quotationNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Quotation number cannot exceed 50 characters']
  },

  quotationFile: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },

  invoiceFile: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: Date
  },

  gstRate: {
    type: Number,
    min: [0, 'GST rate cannot be negative'],
    max: [100, 'GST rate cannot exceed 100%'],
    default: 18
  },

  // Delivery and Buyer Information
  deliveryAddress: {
    street: {
      type: String,
      required: [true, 'Delivery street address is required']
    },
    city: {
      type: String,
      required: [true, 'Delivery city is required']
    },
    state: {
      type: String,
      required: [true, 'Delivery state is required']
    },
    pincode: {
      type: String,
      required: [true, 'Delivery pincode is required'],
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    country: {
      type: String,
      default: 'India'
    }
  },

  buyerName: {
    type: String,
    required: [true, 'Buyer name is required'],
    trim: true,
    maxlength: [100, 'Buyer name cannot exceed 100 characters']
  },

  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },

  // Additional Information
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  internalNotes: {
    type: String,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  },
  
  terms: {
    type: String,
    maxlength: [2000, 'Terms cannot exceed 2000 characters']
  },

  // Shipping Information
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  billingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },

  // Tracking
  trackingNumber: {
    type: String
  },
  
  invoiceNumber: {
    type: String
  },
  
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
    default: 'Pending'
  },
  
  paymentTerms: {
    type: String,
    enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Advance 25%', 'Advance 50%', 'Advance 75%', 'Advance 100%'],
    default: 'Net 30'
  },

  // Enhanced Approval System
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  approverName: {
    type: String,
    trim: true,
    maxlength: [100, 'Approver name cannot exceed 100 characters']
  },

  approverRole: {
    type: String,
    enum: ['admin', 'Manager', 'Senior Manager', 'Director', 'Finance Head', 'CEO'],
    default: 'admin'
  },

  approvedAt: {
    type: Date
  },

  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  rejectedAt: {
    type: Date
  },

  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },

  // Admin approval required flag
  requiresApproval: {
    type: Boolean,
    default: true
  },

  // Audit Information
  createdBy: {
    type: String,
    default: 'System'
  },
  
  approvedBy: {
    type: String
  },
  
  approvedAt: {
    type: Date
  },
  
  lastModifiedBy: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
purchaseOrderSchema.index({ vendorId: 1, orderDate: -1 });
purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: -1 });
purchaseOrderSchema.index({ expectedDeliveryDate: 1 });

// Virtual for formatted order date
purchaseOrderSchema.virtual('formattedOrderDate').get(function() {
  return this.orderDate ? this.orderDate.toISOString().split('T')[0] : null;
});

// Virtual for days until delivery
purchaseOrderSchema.virtual('daysUntilDelivery').get(function() {
  if (!this.expectedDeliveryDate) return null;
  const today = new Date();
  const deliveryDate = new Date(this.expectedDeliveryDate);
  const diffTime = deliveryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for order age
purchaseOrderSchema.virtual('orderAge').get(function() {
  const today = new Date();
  const orderDate = new Date(this.orderDate);
  const diffTime = today - orderDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to calculate totals and handle workflow
purchaseOrderSchema.pre('save', function(next) {
  // Calculate item-level totals and taxes
  this.items.forEach(item => {
    // Calculate total price for each item
    item.totalPrice = item.quantity * item.unitPrice;

    // Calculate tax amount for each item
    item.taxAmount = (item.totalPrice * item.taxRate) / 100;
  });

  // Calculate subtotal from items (before tax)
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Calculate total tax amount from all items
  this.taxAmount = this.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);

  // Calculate final total amount
  this.totalAmount = this.subtotal + this.taxAmount + this.shippingCharges + this.otherCharges - this.discountAmount;

  // Update last modified
  this.lastModifiedBy = this.lastModifiedBy || 'System';

  // Add workflow history entry if status changed
  if (this.isModified('status') && !this.isNew) {
    this.workflowHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.lastModifiedBy,
      notes: `Status changed to ${this.status}`
    });
  }

  next();
});

// Static method to get recent orders for a vendor
purchaseOrderSchema.statics.getRecentOrdersForVendor = function(vendorId, limit = 5) {
  return this.find({ 
    vendorId, 
    status: { $in: ['Completed', 'Delivered', 'Shipped'] } 
  })
  .sort({ orderDate: -1 })
  .limit(limit)
  .select('poNumber orderDate totalAmount status currency');
};

// Static method to get vendor statistics
purchaseOrderSchema.statics.getVendorStats = function(vendorId) {
  return this.aggregate([
    { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        averageOrderValue: { $avg: '$totalAmount' },
        lastOrderDate: { $max: '$orderDate' }
      }
    }
  ]);
};

// Instance method to mark as delivered
purchaseOrderSchema.methods.markAsDelivered = function(deliveryDate = new Date()) {
  this.status = 'Delivered';
  this.actualDeliveryDate = deliveryDate;
  return this.save();
};

// Instance method to calculate delivery performance
purchaseOrderSchema.methods.getDeliveryPerformance = function() {
  if (!this.actualDeliveryDate || !this.expectedDeliveryDate) return null;
  
  const expected = new Date(this.expectedDeliveryDate);
  const actual = new Date(this.actualDeliveryDate);
  const diffTime = actual - expected;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    onTime: diffDays <= 0,
    daysLate: diffDays > 0 ? diffDays : 0,
    daysEarly: diffDays < 0 ? Math.abs(diffDays) : 0
  };
};

// Instance method to generate invoice data
purchaseOrderSchema.methods.generateInvoiceData = function() {
  return {
    invoiceNumber: this.invoiceNumber || `INV-${this.poNumber}`,
    poNumber: this.poNumber,
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    vendor: {
      name: this.vendorName,
      // Add vendor details from populated vendor
    },
    items: this.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    })),
    subtotal: this.subtotal,
    taxAmount: this.taxAmount,
    discountAmount: this.discountAmount,
    totalAmount: this.totalAmount,
    currency: this.currency,
    terms: this.terms || 'Payment due within 30 days',
    notes: this.notes
  };
};

// Instance method to generate bill data (for vendor bills)
purchaseOrderSchema.methods.generateBillData = function() {
  return {
    billNumber: `BILL-${this.poNumber}`,
    poNumber: this.poNumber,
    billDate: new Date(),
    vendor: {
      name: this.vendorName,
    },
    items: this.items,
    subtotal: this.subtotal,
    taxAmount: this.taxAmount,
    totalAmount: this.totalAmount,
    currency: this.currency,
    status: this.paymentStatus
  };
};

// Workflow automation methods
purchaseOrderSchema.methods.approve = function(approverName, approverRole, notes = '') {
  if (this.status !== 'Draft') {
    throw new Error('Only draft purchase orders can be approved');
  }

  this.status = 'Approved';
  this.approvalStatus = 'Approved';
  this.approverName = approverName;
  this.approverRole = approverRole;
  this.approvedBy = approverName;
  this.approvedAt = new Date();

  this.workflowHistory.push({
    status: 'Approved',
    timestamp: new Date(),
    updatedBy: approverName,
    notes: notes || `Approved by ${approverName} (${approverRole})`
  });

  return this.save();
};

purchaseOrderSchema.methods.markDelivered = function(updatedBy, deliveryDate = null, notes = '') {
  if (this.status !== 'Approved') {
    throw new Error('Only approved purchase orders can be marked as delivered');
  }

  this.status = 'Delivered';
  this.actualDeliveryDate = deliveryDate || new Date();

  this.workflowHistory.push({
    status: 'Delivered',
    timestamp: new Date(),
    updatedBy: updatedBy,
    notes: notes || 'Order delivered successfully'
  });

  return this.save();
};

purchaseOrderSchema.methods.markInvoiced = function(updatedBy, invoiceFile, notes = '') {
  if (this.status !== 'Delivered') {
    throw new Error('Only delivered purchase orders can be marked as invoiced');
  }

  this.status = 'Invoiced';
  if (invoiceFile) {
    this.invoiceFile = invoiceFile;
  }

  this.workflowHistory.push({
    status: 'Invoiced',
    timestamp: new Date(),
    updatedBy: updatedBy,
    notes: notes || 'Invoice uploaded and processed'
  });

  return this.save();
};

purchaseOrderSchema.methods.markPaid = function(updatedBy, paymentDate = null, notes = '') {
  if (this.status !== 'Invoiced') {
    throw new Error('Only invoiced purchase orders can be marked as paid');
  }

  this.status = 'Paid';
  this.paymentStatus = 'Paid';

  this.workflowHistory.push({
    status: 'Paid',
    timestamp: new Date(),
    updatedBy: updatedBy,
    notes: notes || 'Payment completed successfully'
  });

  return this.save();
};

purchaseOrderSchema.methods.reject = function(rejectedBy, reason, notes = '') {
  if (this.status !== 'Draft') {
    throw new Error('Only draft purchase orders can be rejected');
  }

  this.approvalStatus = 'Rejected';
  this.rejectionReason = reason;

  this.workflowHistory.push({
    status: 'Rejected',
    timestamp: new Date(),
    updatedBy: rejectedBy,
    notes: notes || `Rejected: ${reason}`
  });

  return this.save();
};

// Static method to get dashboard statistics
purchaseOrderSchema.statics.getDashboardStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        totalPurchaseValue: { $sum: '$totalAmount' },
        pendingPayments: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Approved', 'Delivered', 'Invoiced']] },
              '$totalAmount',
              0
            ]
          }
        },
        draftOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] }
        },
        approvedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
        },
        invoicedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Invoiced'] }, 1, 0] }
        },
        paidOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] }
        }
      }
    }
  ]);
};

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;
