import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Basic Product Information
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  
  productCode: {
    type: String,
    required: [true, 'Product code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Drones', 
      'Electronics', 
      'Mechanical', 
      'Software', 
      'Accessories', 
      'Batteries', 
      'Sensors', 
      'Cameras', 
      'Propellers', 
      'Motors',
      'Controllers',
      'Spare Parts',
      'Tools',
      'Others'
    ]
  },
  
  subcategory: {
    type: String,
    trim: true
  },

  // Vendor Information
  primaryVendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Primary vendor is required']
  },
  
  alternativeVendors: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    vendorName: String,
    unitPrice: Number,
    leadTime: Number, // in days
    minimumOrderQuantity: Number,
    isPreferred: { type: Boolean, default: false }
  }],

  // Pricing Information
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
    default: 'INR'
  },
  
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  
  sellingPrice: {
    type: Number,
    min: [0, 'Selling price cannot be negative']
  },

  // Inventory Information
  currentStock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  
  minimumStock: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock cannot be negative']
  },
  
  maximumStock: {
    type: Number,
    default: 1000,
    min: [0, 'Maximum stock cannot be negative']
  },
  
  reorderLevel: {
    type: Number,
    default: 20,
    min: [0, 'Reorder level cannot be negative']
  },
  
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['Piece', 'Set', 'Kg', 'Gram', 'Liter', 'Meter', 'Box', 'Pack', 'Dozen']
  },

  // Technical Specifications
  specifications: {
    weight: { type: String },
    dimensions: { type: String },
    material: { type: String },
    color: { type: String },
    model: { type: String },
    brand: { type: String },
    warranty: { type: String },
    certifications: [{ type: String }],
    technicalDetails: { type: String }
  },

  // Purchase History
  totalPurchased: {
    type: Number,
    default: 0
  },
  
  totalValue: {
    type: Number,
    default: 0
  },
  
  lastPurchaseDate: {
    type: Date
  },
  
  lastPurchasePrice: {
    type: Number
  },
  
  averagePurchasePrice: {
    type: Number
  },

  // Vendor Performance for this Product
  vendorPerformance: {
    averageLeadTime: { type: Number }, // in days
    onTimeDeliveryRate: { type: Number }, // percentage
    qualityRating: { type: Number, min: 1, max: 5 }, // 1-5 stars
    totalOrders: { type: Number, default: 0 },
    lastOrderDate: { type: Date }
  },

  // Status and Flags
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Discontinued', 'Out of Stock'],
    default: 'Active'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isCritical: {
    type: Boolean,
    default: false
  },
  
  isHazardous: {
    type: Boolean,
    default: false
  },

  // Images and Documents
  images: [{
    url: String,
    description: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  documents: [{
    name: String,
    url: String,
    type: { type: String, enum: ['Manual', 'Certificate', 'Datasheet', 'Other'] }
  }],

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
productSchema.index({ productCode: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ primaryVendorId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ currentStock: 1 });
productSchema.index({ lastPurchaseDate: -1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'Out of Stock';
  if (this.currentStock <= this.reorderLevel) return 'Low Stock';
  if (this.currentStock <= this.minimumStock) return 'Minimum Stock';
  return 'In Stock';
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (!this.costPrice || !this.sellingPrice) return null;
  return ((this.sellingPrice - this.costPrice) / this.costPrice * 100).toFixed(2);
});

// Virtual for stock value
productSchema.virtual('stockValue').get(function() {
  return this.currentStock * this.unitPrice;
});

// Static method to get products by vendor
productSchema.statics.getProductsByVendor = function(vendorId) {
  return this.find({
    $or: [
      { primaryVendorId: vendorId },
      { 'alternativeVendors.vendorId': vendorId }
    ]
  })
  .select('productName category lastPurchaseDate vendorPerformance')
  .sort({ lastPurchaseDate: -1 });
};

// Static method to get low stock products
productSchema.statics.getLowStockProducts = function() {
  return this.find({
    $expr: { $lte: ['$currentStock', '$reorderLevel'] },
    status: 'Active'
  }).sort({ currentStock: 1 });
};

// Instance method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'add') {
  if (operation === 'add') {
    this.currentStock += quantity;
  } else if (operation === 'subtract') {
    this.currentStock = Math.max(0, this.currentStock - quantity);
  } else {
    this.currentStock = quantity;
  }
  return this.save();
};

// Instance method to record purchase
productSchema.methods.recordPurchase = function(quantity, price, date = new Date()) {
  this.totalPurchased += quantity;
  this.totalValue += (quantity * price);
  this.lastPurchaseDate = date;
  this.lastPurchasePrice = price;
  this.averagePurchasePrice = this.totalValue / this.totalPurchased;
  this.vendorPerformance.totalOrders += 1;
  this.vendorPerformance.lastOrderDate = date;
  
  return this.save();
};

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Ensure minimum stock is not greater than maximum stock
  if (this.minimumStock > this.maximumStock) {
    this.minimumStock = this.maximumStock;
  }
  
  // Ensure reorder level is between minimum and maximum
  if (this.reorderLevel < this.minimumStock) {
    this.reorderLevel = this.minimumStock;
  }
  if (this.reorderLevel > this.maximumStock) {
    this.reorderLevel = this.maximumStock;
  }
  
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
