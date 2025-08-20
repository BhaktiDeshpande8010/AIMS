import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, Package, FileText, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';
import Button from '../../components/Button';
import { purchaseService } from '../../services/purchaseService';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await purchaseService.getPurchaseById(id);
      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Error loading order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-blue-100 text-blue-800';
  };

  const getTimelineSteps = (status, orderDate, expectedDelivery) => {
    const steps = [
      { name: 'Order Placed', icon: FileText, completed: true, date: orderDate },
      { name: 'Approved', icon: CheckCircle, completed: ['Approved', 'Shipped', 'Delivered', 'Completed'].includes(status) },
      { name: 'Shipped', icon: Truck, completed: ['Shipped', 'Delivered', 'Completed'].includes(status) },
      { name: 'Delivered', icon: MapPin, completed: ['Delivered', 'Completed'].includes(status), date: expectedDelivery }
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps(order.status, order.orderDate, order.expectedDeliveryDate);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* Centered Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full lg:w-4/5 xl:w-3/4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>Back to Purchases</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Order Details</h1>
                <p className="text-blue-600">Purchase Order #{order.poNumber}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
                <div className="space-y-4">
                  {timelineSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.name}
                          </p>
                          {step.date && (
                            <p className="text-sm text-gray-500">
                              {new Date(step.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {step.completed && (
                          <CheckCircle size={20} className="text-green-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                              <div className="text-sm text-gray-500">{item.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{item.unitPrice?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{item.totalPrice?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Expected Delivery</p>
                      <p className="font-medium">{new Date(order.expectedDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Package size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Vendor</p>
                      <p className="font-medium">{order.vendorName}</p>
                    </div>
                  </div>

                  {order.quotationNumber && (
                    <div className="flex items-center space-x-3">
                      <FileText size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Quotation No.</p>
                        <p className="font-medium">{order.quotationNumber}</p>
                      </div>
                    </div>
                  )}

                  {order.hsnCode && (
                    <div className="flex items-center space-x-3">
                      <FileText size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">HSN Code</p>
                        <p className="font-medium">{order.hsnCode}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{order.subtotal?.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">GST ({order.gstRate || 18}%)</span>
                    <span className="font-medium">₹{order.taxAmount?.toLocaleString()}</span>
                  </div>

                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{order.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount</span>
                      <span>₹{order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {order.notes && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <p className="text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
