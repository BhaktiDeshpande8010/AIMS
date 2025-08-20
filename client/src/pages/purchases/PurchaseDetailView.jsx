import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Package, Calendar, DollarSign, User, FileText } from 'lucide-react';
import Button from '../../components/Button';

const PurchaseDetailView = ({ purchase, onBack, onEdit }) => {
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (!purchase) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No purchase data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Back to Purchases</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{purchase.poNumber}</h1>
            <p className="text-gray-600">Purchase Order Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.status)}`}>
            {purchase.status}
          </span>
          <Button
            onClick={() => onEdit(purchase)}
            className="flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit Purchase</span>
          </Button>
        </div>
      </div>

      {/* Purchase Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">PO Number</label>
                <p className="mt-1 text-sm text-gray-900 font-medium">{purchase.poNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Vendor</label>
                <p className="mt-1 text-sm text-gray-900">{purchase.vendorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Order Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(purchase.orderDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Expected Delivery</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(purchase.expectedDeliveryDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Payment Terms</label>
                <p className="mt-1 text-sm text-gray-900">{purchase.paymentTerms || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Priority</label>
                <p className="mt-1 text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    purchase.priority === 'High' ? 'bg-red-100 text-red-800' :
                    purchase.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {purchase.priority || 'Normal'}
                  </span>
                </p>
              </div>
            </div>
            
            {purchase.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500">Notes</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{purchase.notes}</p>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchase.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        {item.productCode && (
                          <div className="text-sm text-gray-500">Code: {item.productCode}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity} {item.unit || 'units'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(purchase.subtotal || purchase.totalAmount)}
                </span>
              </div>
              {purchase.taxAmount && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tax</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(purchase.taxAmount)}
                  </span>
                </div>
              )}
              {purchase.discountAmount && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Discount</span>
                  <span className="text-sm font-medium text-red-600">
                    -{formatCurrency(purchase.discountAmount)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total Amount</span>
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(purchase.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText size={16} className="mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package size={16} className="mr-2" />
                Track Delivery
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign size={16} className="mr-2" />
                Record Payment
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Created</p>
                  <p className="text-xs text-gray-500">{formatDate(purchase.createdAt)}</p>
                </div>
              </div>
              {purchase.updatedAt && purchase.updatedAt !== purchase.createdAt && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(purchase.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailView;
