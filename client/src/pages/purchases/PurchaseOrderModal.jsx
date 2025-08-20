import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import StyledSelect from '../../components/StyledSelect';

const PurchaseOrderModal = ({ isOpen, onClose, onSubmit, editMode = false, purchaseData = null }) => {
  const [formData, setFormData] = useState({});



  // Initialize form data when editing
  useEffect(() => {
    if (editMode && purchaseData) {
      setFormData({
        poNumber: purchaseData.poNumber || '',
        vendorName: purchaseData.vendorName || '',
        totalAmount: purchaseData.totalAmount || '',
        orderDate: purchaseData.orderDate || '',
        expectedDeliveryDate: purchaseData.expectedDeliveryDate || '',
        // Add other fields as needed
      });
    } else {
      setFormData({
        orderDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [editMode, purchaseData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate vendor name
    if (!formData.vendorName || formData.vendorName.trim() === '') {
      toast.error('Please enter vendor name');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };





  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${editMode ? 'Edit' : 'Create'} Purchase Order`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Number *
              </label>
              <input
                type="text"
                name="poNumber"
                required
                value={formData.poNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="PO-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name *
              </label>
              <input
                type="text"
                name="vendorName"
                required
                value={formData.vendorName || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-medium"
                onChange={handleChange}
                placeholder="Enter vendor name..."
              />
              <p className="text-xs text-gray-500 mt-1">Enter the exact vendor name as registered</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quotation No.
              </label>
              <input
                type="text"
                name="quotationNumber"
                value={formData.quotationNumber || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="QUO-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HSN Code
              </label>
              <input
                type="text"
                name="hsnCode"
                value={formData.hsnCode || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="8525"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date *
              </label>
              <input
                type="date"
                name="orderDate"
                required
                value={formData.orderDate || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery *
              </label>
              <input
                type="date"
                name="expectedDeliveryDate"
                required
                value={formData.expectedDeliveryDate || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Items Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Items</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Description
              </label>
              <textarea
                name="itemDescription"
                rows="3"
                value={formData.itemDescription || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                onChange={handleChange}
                placeholder="Describe the items being purchased"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  onChange={handleChange}
                  placeholder="Enter quantity"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  onChange={handleChange}
                  placeholder="Enter unit price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount *
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  required
                  value={formData.totalAmount || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  onChange={handleChange}
                  placeholder="Enter total amount"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <StyledSelect
                value={{
                  value: formData.status || 'Pending',
                  label: formData.status || 'Pending'
                }}
                onChange={(selectedOption) => {
                  setFormData(prev => ({
                    ...prev,
                    status: selectedOption.value
                  }));
                }}
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Shipped', label: 'Shipped' },
                  { value: 'Delivered', label: 'Delivered' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
                isSearchable={false}
                placeholder="Select status..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Rate (%)
              </label>
              <input
                type="number"
                name="gstRate"
                min="0"
                max="100"
                step="0.01"
                value={formData.gstRate || '18'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="18"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
              onChange={handleChange}
              placeholder="Additional notes or special instructions"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8"
          >
            {editMode ? 'Update Purchase Order' : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PurchaseOrderModal;
