import React from 'react';
import { ArrowLeft, Edit } from 'lucide-react';
import Button from '../../components/Button';

const CustomerDetailView = ({ customer, onBack, onEdit }) => {
  const mockOrders = [
    { id: 'SO-001', date: '2024-01-15', amount: '₹45,000', status: 'Delivered' },
    { id: 'SO-002', date: '2024-01-20', amount: '₹28,500', status: 'Processing' },
    { id: 'SO-003', date: '2024-01-25', amount: '₹62,000', status: 'Shipped' }
  ];

  const mockProducts = [
    { name: 'Agricultural Drone Model X1', category: 'Drones', lastOrder: '2024-01-25' },
    { name: 'Precision Spraying Kit', category: 'Accessories', lastOrder: '2024-01-20' },
    { name: 'Crop Monitoring Software', category: 'Software', lastOrder: '2024-01-15' }
  ];

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
            <span>Back to Customers</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.customerName}</h1>
            <p className="text-gray-600">{customer.customerType} Customer</p>
          </div>
        </div>
        
        <Button
          onClick={onEdit}
          className="flex items-center space-x-2"
        >
          <Edit size={20} />
          <span>Edit Customer</span>
        </Button>
      </div>

      {/* Customer Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Customer Name</label>
              <p className="text-gray-900">{customer.customerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                customer.customerType === 'Individual' ? 'bg-blue-100 text-blue-800' :
                customer.customerType === 'Business' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {customer.customerType}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Contact</label>
              <p className="text-gray-900">{customer.phoneNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{customer.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {customer.status}
              </span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address & Location</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-gray-900">{customer.address}</p>
            </div>
            {customer.city && (
              <div>
                <label className="text-sm font-medium text-gray-500">City</label>
                <p className="text-gray-900">{customer.city}</p>
              </div>
            )}
            {customer.state && (
              <div>
                <label className="text-sm font-medium text-gray-500">State</label>
                <p className="text-gray-900">{customer.state}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-gray-900">{customer.createdAt}</p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
          <div className="space-y-3">
            {customer.gstNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">GST Number</label>
                <p className="text-gray-900">{customer.gstNumber}</p>
              </div>
            )}
            {customer.panNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">PAN</label>
                <p className="text-gray-900">{customer.panNumber}</p>
              </div>
            )}
            {customer.industry && (
              <div>
                <label className="text-sm font-medium text-gray-500">Industry</label>
                <p className="text-gray-900">{customer.industry}</p>
              </div>
            )}
            {customer.companySize && (
              <div>
                <label className="text-sm font-medium text-gray-500">Company Size</label>
                <p className="text-gray-900">{customer.companySize}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Purchased */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Products Purchased</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProducts.map((product, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.category}</p>
                <p className="text-xs text-gray-400 mt-1">Last order: {product.lastOrder}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;
