import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

const ProcurementModal = ({ isOpen, onClose, onSubmit, employee }) => {
  const [formData, setFormData] = useState({
    purpose: '',
    priority: 'Medium',
    urgencyReason: '',
    notes: ''
  });
  
  const [products, setProducts] = useState([
    {
      id: 1,
      productName: '',
      productDetails: '',
      quantity: 1,
      unitCost: 0,
      tax: 0,
      totalCost: 0
    }
  ]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        purpose: '',
        priority: 'Medium',
        urgencyReason: '',
        notes: ''
      });
      setProducts([
        {
          id: 1,
          productName: '',
          productDetails: '',
          quantity: 1,
          unitCost: 0,
          tax: 0,
          totalCost: 0
        }
      ]);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (productId, field, value) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const updatedProduct = { ...product, [field]: value };
        
        // Calculate total cost when quantity, unitCost, or tax changes
        if (field === 'quantity' || field === 'unitCost' || field === 'tax') {
          const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(product.quantity) || 0;
          const unitCost = field === 'unitCost' ? parseFloat(value) || 0 : parseFloat(product.unitCost) || 0;
          const tax = field === 'tax' ? parseFloat(value) || 0 : parseFloat(product.tax) || 0;

          updatedProduct.totalCost = (quantity * unitCost) + tax;
        }
        
        return updatedProduct;
      }
      return product;
    }));
  };

  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      productName: '',
      productDetails: '',
      quantity: 1,
      unitCost: 0,
      tax: 0,
      totalCost: 0
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const removeProduct = (productId) => {
    if (products.length > 1) {
      setProducts(prev => prev.filter(product => product.id !== productId));
    } else {
      toast.error('At least one product is required');
    }
  };

  // Calculate totals
  const totals = {
    totalProducts: products.length,
    totalQuantity: products.reduce((sum, product) => sum + (parseFloat(product.quantity) || 0), 0),
    totalUnitCost: products.reduce((sum, product) => sum + ((parseFloat(product.quantity) || 0) * (parseFloat(product.unitCost) || 0)), 0),
    totalTax: products.reduce((sum, product) => sum + (parseFloat(product.tax) || 0), 0),
    grandTotal: products.reduce((sum, product) => sum + (parseFloat(product.totalCost) || 0), 0)
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate products
    const validProducts = products.filter(product => 
      product.productName.trim() && 
      product.productDetails.trim() && 
      product.quantity > 0 && 
      product.unitCost >= 0
    );
    
    if (validProducts.length === 0) {
      toast.error('Please add at least one valid product');
      return;
    }
    
    if (validProducts.length !== products.length) {
      toast.error('Please fill all product details correctly');
      return;
    }
    
    // Prepare submission data
    const submitData = {
      ...formData,
      items: validProducts.map(product => ({
        productName: product.productName,
        productDetails: product.productDetails,
        quantity: product.quantity,
        unitCost: product.unitCost,
        tax: product.tax,
        totalCost: product.totalCost
      })),
      ...totals
    };
    
    onSubmit(submitData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Procurement Request" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Information (Read-only) */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Employee Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Employee ID:</span>
              <span className="ml-2 font-medium">{employee?.employeeId}</span>
            </div>
            <div>
              <span className="text-gray-500">Employee Name:</span>
              <span className="ml-2 font-medium">{employee?.employeeName}</span>
            </div>
            <div>
              <span className="text-gray-500">Department:</span>
              <span className="ml-2 font-medium">{employee?.department}</span>
            </div>
            <div>
              <span className="text-gray-500">Position:</span>
              <span className="ml-2 font-medium">{employee?.position}</span>
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <textarea
              name="purpose"
              rows="3"
              value={formData.purpose}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Describe the purpose of this procurement request"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              name="priority"
              required
              value={formData.priority}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {formData.priority === 'Urgent' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Reason *
              </label>
              <textarea
                name="urgencyReason"
                rows="2"
                required
                value={formData.urgencyReason}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="Explain why this request is urgent"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              rows="2"
              value={formData.notes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={handleChange}
              placeholder="Any additional notes or requirements"
            />
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Products</h4>
            <Button
              type="button"
              variant="outline"
              onClick={addProduct}
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </Button>
          </div>

          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-900">Product {index + 1}</h5>
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={product.productName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Details *
                    </label>
                    <input
                      type="text"
                      required
                      value={product.productDetails}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handleProductChange(product.id, 'productDetails', e.target.value)}
                      placeholder="Enter product details/specifications"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={product.quantity}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handleProductChange(product.id, 'quantity', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={product.unitCost}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handleProductChange(product.id, 'unitCost', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.tax}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handleProductChange(product.id, 'tax', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={(product.totalCost || 0).toFixed(2)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-blue-600">Total Products</p>
              <p className="text-xl font-bold text-blue-900">{totals.totalProducts}</p>
            </div>
            <div>
              <p className="text-blue-600">Total Quantity</p>
              <p className="text-xl font-bold text-blue-900">{totals.totalQuantity}</p>
            </div>
            <div>
              <p className="text-blue-600">Total Unit Cost</p>
              <p className="text-xl font-bold text-blue-900">₹{(totals.totalUnitCost || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-blue-600">Total Tax</p>
              <p className="text-xl font-bold text-blue-900">₹{(totals.totalTax || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-blue-600">Grand Total</p>
              <p className="text-2xl font-bold text-blue-900">₹{(totals.grandTotal || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button"
            variant="secondary" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Procurement Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProcurementModal;
