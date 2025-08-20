import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

const HSNModal = ({ isOpen, onClose, editMode, hsnData, products, onSubmit }) => {
  const [formData, setFormData] = useState({
    hsnCode: '',
    hsnDetails: '',
    gst: '',
    bcd: '',
    sw: '',
    part: ''
  });
  const [loading, setLoading] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (editMode && hsnData) {
      setFormData({
        hsnCode: hsnData.hsnCode || '',
        hsnDetails: hsnData.hsnDetails || '',
        gst: hsnData.gst || '',
        bcd: hsnData.bcd || '',
        sw: hsnData.sw || '',
        part: hsnData.part || ''
      });
    } else {
      setFormData({
        hsnCode: '',
        hsnDetails: '',
        gst: '',
        bcd: '',
        sw: '',
        part: ''
      });
    }
  }, [editMode, hsnData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting HSN form:', error);
    } finally {
      setLoading(false);
    }
  };

  const gstOptions = Array.from({ length: 24 }, (_, i) => i + 1);
  const bcdOptions = Array.from({ length: 24 }, (_, i) => i + 1);
  const swOptions = Array.from({ length: 24 }, (_, i) => i + 1);

  const partOptions = [
    'Electronics',
    'Mechanical Parts',
    'Optical Equipment',
    'Computers',
    'Software',
    'Accessories',
    'Raw Materials',
    'Finished Goods',
    'Components',
    'Tools'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${editMode ? 'Edit' : 'Add'} HSN Code`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* HSN Code Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">HSN Code Information</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HSN Code (8-digit) *
              </label>
              <input
                type="text"
                name="hsnCode"
                required
                pattern="[0-9]{8}"
                maxLength="8"
                value={formData.hsnCode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
                placeholder="12345678"
              />
              <p className="text-xs text-gray-500 mt-1">Enter 8-digit HSN classification code</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part *
              </label>
              <select
                name="part"
                required
                value={formData.part}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              >
                <option value="">Select Part Category</option>
                {partOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HSN Details *
              </label>
              <textarea
                name="hsnDetails"
                required
                rows="3"
                value={formData.hsnDetails}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                onChange={handleChange}
                placeholder="Enter detailed description of the HSN code classification"
              />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST (%) *
              </label>
              <select
                name="gst"
                required
                value={formData.gst}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              >
                <option value="">Select GST Rate</option>
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
                {gstOptions.map((rate) => (
                  <option key={rate} value={rate}>{rate}%</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BCD (%) *
              </label>
              <select
                name="bcd"
                required
                value={formData.bcd}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              >
                <option value="">Select BCD Rate</option>
                <option value="0">0%</option>
                {bcdOptions.map((rate) => (
                  <option key={rate} value={rate}>{rate}%</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SW (%) *
              </label>
              <select
                name="sw"
                required
                value={formData.sw}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                onChange={handleChange}
              >
                <option value="">Select SW Rate</option>
                <option value="0">0%</option>
                {swOptions.map((rate) => (
                  <option key={rate} value={rate}>{rate}%</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Inventory */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Inventory</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.productCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{product.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className={`px-8 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {editMode ? 'Update HSN Code' : 'Create HSN Code'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HSNModal;
