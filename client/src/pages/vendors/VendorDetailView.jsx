import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Package, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import { purchaseService } from '../../services/purchaseService';
import productService from '../../services/productService';


const VendorDetailView = ({ vendor, onBack, onEdit }) => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendor?._id) {
      fetchVendorData();
    }
  }, [vendor]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);

      // Fetch recent orders for this vendor
      const ordersResponse = await purchaseService.getPurchases();
      if (ordersResponse.success && ordersResponse.purchases && Array.isArray(ordersResponse.purchases)) {
        // Filter orders by vendor ID and vendor name
        const vendorOrders = ordersResponse.purchases.filter(order => {
          return (
            (order.vendorId === vendor._id) ||
            (order.vendorId?._id === vendor._id) ||
            (order.vendorName === vendor.vendorName)
          );
        }).slice(0, 5); // Get latest 5 orders
        setRecentOrders(vendorOrders);
      } else {
        setRecentOrders([]);
      }

      // Fetch products supplied by this vendor from purchase history
      const allPurchases = ordersResponse.purchases || [];
      const vendorPurchases = allPurchases.filter(order => {
        return (
          (order.vendorId === vendor._id) ||
          (order.vendorId?._id === vendor._id) ||
          (order.vendorName === vendor.vendorName)
        );
      });

      // Extract unique products from purchase history
      const productsFromPurchases = [];
      vendorPurchases.forEach(purchase => {
        if (purchase.items && Array.isArray(purchase.items)) {
          purchase.items.forEach(item => {
            // Check if product already exists in the list
            const existingProduct = productsFromPurchases.find(p =>
              p.productName === item.productName
            );

            if (!existingProduct) {
              productsFromPurchases.push({
                id: item.productId || item._id || Math.random().toString(36),
                productName: item.productName,
                description: item.description,
                lastOrderDate: purchase.orderDate,
                totalQuantityOrdered: item.quantity,
                lastUnitPrice: item.unitPrice,
                category: item.category || 'General'
              });
            } else {
              // Update existing product with latest info
              existingProduct.totalQuantityOrdered += item.quantity;
              if (new Date(purchase.orderDate) > new Date(existingProduct.lastOrderDate)) {
                existingProduct.lastOrderDate = purchase.orderDate;
                existingProduct.lastUnitPrice = item.unitPrice;
              }
            }
          });
        }
      });

      setVendorProducts(productsFromPurchases);

    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to load vendor data');
      setRecentOrders([]);
      setVendorProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };




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
            <span>Back to Vendors</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.vendorName}</h1>
            <p className="text-gray-600">{vendor.vendorType} Vendor</p>
          </div>
        </div>
        
        <Button
          onClick={onEdit}
          className="flex items-center space-x-2"
        >
          <Edit size={20} />
          <span>Edit Vendor</span>
        </Button>
      </div>

      {/* Vendor Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Vendor Name</label>
              <p className="text-gray-900">{vendor.vendorName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                vendor.vendorType === 'Local' ? 'bg-blue-100 text-blue-800' :
                vendor.vendorType === 'National' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {vendor.vendorType}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Contact</label>
              <p className="text-gray-900">{vendor.phoneNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{vendor.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {vendor.status}
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
              <p className="text-gray-900">{vendor.address}</p>
            </div>
            {vendor.country && (
              <div>
                <label className="text-sm font-medium text-gray-500">Country</label>
                <p className="text-gray-900">{vendor.country}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-gray-900">{vendor.createdAt}</p>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
          <div className="space-y-3">
            {vendor.gstNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">GST Number</label>
                <p className="text-gray-900">{vendor.gstNumber}</p>
              </div>
            )}
            {vendor.panNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">PAN</label>
                <p className="text-gray-900">{vendor.panNumber}</p>
              </div>
            )}
            {vendor.currency && (
              <div>
                <label className="text-sm font-medium text-gray-500">Currency</label>
                <p className="text-gray-900">{vendor.currency}</p>
              </div>
            )}
            {vendor.swiftCode && (
              <div>
                <label className="text-sm font-medium text-gray-500">SWIFT/BIC</label>
                <p className="text-gray-900">{vendor.swiftCode}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Purchase Orders</h3>
            <p className="text-sm text-gray-500">Orders placed with this vendor (from Purchase Orders table)</p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {recentOrders.length} orders
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  </td>
                </tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.poNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={order.items?.map(item => `${item.productName} x${item.quantity}`).join(', ')}>
                        {order.items?.map(item => `${item.productName} x${item.quantity}`).join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium"
                        onClick={() => handleViewOrder(order._id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No recent orders found for this vendor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500">
          💡 <strong>Data Source:</strong> This data comes from the Purchase Orders table where vendor_id matches this vendor
        </div>
      </div>

      {/* Products Supplied */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Products Supplied by Vendor</h3>
            <p className="text-sm text-gray-500">Products this vendor has supplied (from Products + Purchase history)</p>
          </div>
          <div className="text-sm text-gray-500">
            {vendorProducts.length} products
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : vendorProducts.length > 0 ? (
              vendorProducts.map((product, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{product.productName}</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {product.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">₹{product.lastUnitPrice?.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Last Price</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{product.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Total Ordered</div>
                    <div className="font-medium text-green-600">{product.totalQuantityOrdered} units</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Last Order</div>
                    <div className="font-medium">{new Date(product.lastOrderDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No products found for this vendor
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500">
          💡 <strong>Data Source:</strong> This data comes from Products table joined with Purchase Order Items where this vendor supplied the products
        </div>
      </div>
    </div>
  );
};

export default VendorDetailView;
