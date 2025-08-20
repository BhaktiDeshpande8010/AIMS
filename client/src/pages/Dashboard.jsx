import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  UserCheck,
  ShoppingCart,
  TrendingUp,
  Clock,
  Activity,
  Plus
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { vendorService } from '../services/vendorService';
import { customerService } from '../services/customerService';
import { purchaseService } from '../services/purchaseService';
import { employeeService } from '../services/employeeService';


const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        vendorsResponse,
        customersResponse,
        employeesResponse,
        purchasesResponse,
        latestPurchasesResponse,
        latestVendorsResponse,
        latestCustomersResponse
      ] = await Promise.all([
        vendorService.getVendors(),
        customerService.getCustomers(),
        employeeService.getEmployees(),
        purchaseService.getPurchases(),
        purchaseService.getPurchases({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        vendorService.getVendors({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        customerService.getCustomers({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      // Calculate summary statistics - handle different response structures
      const vendorsData = vendorsResponse.success ? vendorsResponse.data : (vendorsResponse.vendors || []);
      const customersData = customersResponse.success ? customersResponse.data : (customersResponse.customers || []);
      const employeesData = employeesResponse.success ? employeesResponse.data : (employeesResponse.employees || []);
      const purchasesData = purchasesResponse.success ? purchasesResponse.data : (purchasesResponse.purchases || []);

      const totalVendors = Array.isArray(vendorsData) ? vendorsData.length : 0;
      const totalCustomers = Array.isArray(customersData) ? customersData.length : 0;
      const totalEmployees = Array.isArray(employeesData) ? employeesData.length : 0;
      const totalPurchases = Array.isArray(purchasesData) ? purchasesData.length : 0;

      // Get dynamic dashboard data from backend
      const dashboardResponse = await dashboardService.getDashboardData();
      const dashboardStats = dashboardResponse.success ? dashboardResponse.data.summary : null;

      // Use backend calculated values or fallback to frontend calculation
      const totalPurchaseValue = dashboardStats?.totalPurchaseValue ||
        (Array.isArray(purchasesData)
          ? purchasesData.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0)
          : 0);

      const pendingPayments = dashboardStats?.pendingPayments ||
        (Array.isArray(purchasesData)
          ? purchasesData
              .filter(purchase => ['approved', 'delivered', 'invoiced'].includes(purchase.status?.toLowerCase()))
              .reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0)
          : 0);

      const pendingRequests = dashboardStats?.pendingRequests ||
        (Array.isArray(purchasesData)
          ? purchasesData.filter(purchase => ['draft', 'approved'].includes(purchase.status?.toLowerCase())).length
          : 0);

      // Format latest purchases
      const latestPurchasesData = latestPurchasesResponse.success ? latestPurchasesResponse.data : (latestPurchasesResponse.purchases || []);
      const latestPurchases = Array.isArray(latestPurchasesData)
        ? latestPurchasesData.map(purchase => ({
            id: purchase._id,
            purchaseId: purchase.poNumber,
            item: purchase.items?.map(item => item.productName).join(', ') || 'N/A',
            total: purchase.totalAmount || 0,
            date: purchase.orderDate || purchase.createdAt
          }))
        : [];

      // Format latest vendors
      const latestVendorsData = latestVendorsResponse.success ? latestVendorsResponse.data : (latestVendorsResponse.vendors || []);
      const latestVendors = Array.isArray(latestVendorsData)
        ? latestVendorsData.map(vendor => ({
            id: vendor._id,
            name: vendor.vendorName,
            type: vendor.vendorType,
            createdAt: vendor.createdAt
          }))
        : [];

      // Format latest customers
      const latestCustomersData = latestCustomersResponse.success ? latestCustomersResponse.data : (latestCustomersResponse.customers || []);
      const latestCustomers = Array.isArray(latestCustomersData)
        ? latestCustomersData.map(customer => ({
            id: customer._id,
            name: customer.customerName,
            type: customer.customerType,
            createdAt: customer.createdAt
          }))
        : [];

      // Generate recent activities from latest data
      const recentActivities = [];

      // Add latest vendor activities
      if (latestVendors.length > 0) {
        latestVendors.slice(0, 2).forEach(vendor => {
          recentActivities.push({
            id: `vendor-${vendor.id}`,
            type: 'vendor',
            description: `${vendor.name} added as ${vendor.type} vendor`,
            timestamp: vendor.createdAt
          });
        });
      }

      // Add latest purchase activities
      if (latestPurchases.length > 0) {
        latestPurchases.slice(0, 2).forEach(purchase => {
          recentActivities.push({
            id: `purchase-${purchase.id}`,
            type: 'purchase',
            description: `${purchase.purchaseId} for ${purchase.item} worth ₹${purchase.total.toLocaleString()}`,
            timestamp: purchase.date
          });
        });
      }

      // Add latest customer activities
      if (latestCustomers.length > 0) {
        latestCustomers.slice(0, 1).forEach(customer => {
          recentActivities.push({
            id: `customer-${customer.id}`,
            type: 'customer',
            description: `${customer.name} registered as ${customer.type} customer`,
            timestamp: customer.createdAt
          });
        });
      }

      // Sort activities by timestamp (newest first)
      recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setDashboardData({
        summary: {
          totalVendors,
          totalCustomers,
          totalEmployees,
          totalPurchases,
          totalPurchaseValue,
          pendingPayments,
          pendingRequests,
          // Add additional purchase workflow metrics if available
          draftPurchases: dashboardStats?.draftPurchases || 0,
          approvedPurchases: dashboardStats?.approvedPurchases || 0,
          deliveredPurchases: dashboardStats?.deliveredPurchases || 0,
          invoicedPurchases: dashboardStats?.invoicedPurchases || 0,
          paidPurchases: dashboardStats?.paidPurchases || 0
        },
        latestPurchases,
        latestVendors,
        latestCustomers,
        pendingRequests: [], // Placeholder until requests API is implemented
        recentActivities: recentActivities.slice(0, 5) // Show only latest 5 activities
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Accounts IMS Dashboard</h1>
        <p className="text-primary-100">
          Manage your agricultural drone manufacturing accounts efficiently
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.totalVendors}</p>
            </div>
            <Building2 className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.totalCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.totalEmployees}</p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.totalPurchases}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-500">Total Purchase Value</p>
              <p className="text-xs text-blue-400 mb-1">Sum of all purchase orders</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(dashboardData.summary.totalPurchaseValue)}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-500">Pending Payments</p>
              <p className="text-xs text-blue-400 mb-1">Orders with 'pending' or 'processing' status</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(dashboardData.summary.pendingPayments)}
              </p>
            </div>
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-500">Pending Requests</p>
              <p className="text-xs text-blue-400 mb-1">Employee procurement requests awaiting approval</p>
              <p className="text-xl font-bold text-blue-600">{dashboardData.summary.pendingRequests}</p>
            </div>
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Purchases */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Latest 5 Purchases</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.latestPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{purchase.purchaseId}</p>
                    <p className="text-sm text-gray-500">{purchase.item}</p>
                    <p className="text-xs text-gray-400">{formatDate(purchase.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(purchase.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Vendor Registrations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Latest 5 Vendor Registrations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.latestVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-sm text-gray-500">{vendor.type} Vendor</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{formatDate(vendor.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Salaries/Payments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending Procurement Requests</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-gray-900">{request.requestId}</p>
                    <p className="text-sm text-gray-600">{request.employeeName}</p>
                    <p className="text-sm text-gray-500">{request.item}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-700">{formatCurrency(request.cost)}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
