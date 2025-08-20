// agri-drone-accounts/server/controllers/dashboardController.js
import Vendor from '../models/Vendor.js';
import Customer from '../models/Customer.js';
import Employee from '../models/Employee.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

export const getDashboardData = async (req, res) => {
  try {
    // Get summary statistics in parallel
    const [
      vendorStats,
      customerStats,
      employeeStats,
      purchaseStats,
      latestPurchases,
      latestVendors,
      pendingPurchases,
      recentActivities
    ] = await Promise.all([
      // Vendor statistics
      Vendor.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
            local: { $sum: { $cond: [{ $eq: ['$vendorType', 'Local'] }, 1, 0] } },
            national: { $sum: { $cond: [{ $eq: ['$vendorType', 'National'] }, 1, 0] } },
            international: { $sum: { $cond: [{ $eq: ['$vendorType', 'International'] }, 1, 0] } },
            totalOrderValue: { $sum: '$totalOrderValue' }
          }
        }
      ]),

      // Customer statistics
      Customer.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
            individual: { $sum: { $cond: [{ $eq: ['$customerType', 'Individual'] }, 1, 0] } },
            business: { $sum: { $cond: [{ $eq: ['$customerType', 'Business'] }, 1, 0] } },
            corporate: { $sum: { $cond: [{ $eq: ['$customerType', 'Corporate'] }, 1, 0] } },
            totalPurchases: { $sum: '$totalPurchases' },
            totalOutstanding: { $sum: '$outstandingAmount' }
          }
        }
      ]),

      // Employee statistics
      Employee.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
            departments: {
              $push: '$department'
            }
          }
        }
      ]),

      // Enhanced Purchase order statistics with new workflow
      PurchaseOrder.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalValue: { $sum: '$totalAmount' },
            // Updated status tracking for new workflow
            draftOrders: { $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] } },
            approvedOrders: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
            deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
            invoicedOrders: { $sum: { $cond: [{ $eq: ['$status', 'Invoiced'] }, 1, 0] } },
            paidOrders: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] } },
            cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
            // Pending payments = orders that are approved, delivered, or invoiced (not yet paid)
            pendingPayments: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Approved', 'Delivered', 'Invoiced']] },
                  '$totalAmount',
                  0
                ]
              }
            },
            // Pending requests = draft orders + approved orders (awaiting action)
            pendingRequests: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Draft', 'Approved']] },
                  1,
                  0
                ]
              }
            },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]),

      // Latest 5 purchases
      PurchaseOrder.find()
        .sort({ orderDate: -1 })
        .limit(5)
        .populate('vendorId', 'vendorName')
        .select('poNumber vendorName totalAmount status orderDate'),

      // Latest 5 vendors
      Vendor.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('vendorName vendorType status createdAt'),

      // Pending purchases
      PurchaseOrder.find({ status: { $in: ['Pending', 'Approved'] } })
        .sort({ orderDate: -1 })
        .limit(10)
        .populate('vendorId', 'vendorName')
        .select('poNumber vendorName totalAmount status expectedDeliveryDate'),

      // Recent activities (mock for now - you can implement activity logging)
      Promise.resolve([
        {
          id: 1,
          type: 'purchase_created',
          message: 'New purchase order created',
          timestamp: new Date(),
          user: 'System'
        },
        {
          id: 2,
          type: 'vendor_registered',
          message: 'New vendor registered',
          timestamp: new Date(Date.now() - 3600000),
          user: 'Admin'
        }
      ])
    ]);

    // Process the results
    const vendorSummary = vendorStats[0] || {
      total: 0, active: 0, local: 0, national: 0, international: 0, totalOrderValue: 0
    };

    const customerSummary = customerStats[0] || {
      total: 0, active: 0, individual: 0, business: 0, corporate: 0, totalPurchases: 0, totalOutstanding: 0
    };

    const employeeSummary = employeeStats[0] || {
      total: 0, active: 0, departments: []
    };

    const purchaseSummary = purchaseStats[0] || {
      total: 0,
      totalValue: 0,
      draftOrders: 0,
      approvedOrders: 0,
      deliveredOrders: 0,
      invoicedOrders: 0,
      paidOrders: 0,
      cancelledOrders: 0,
      pendingPayments: 0,
      pendingRequests: 0,
      averageOrderValue: 0
    };

    // Count unique departments
    const uniqueDepartments = [...new Set(employeeSummary.departments)].length;

    const dashboardData = {
      summary: {
        // Vendor metrics
        totalVendors: vendorSummary.total,
        activeVendors: vendorSummary.active,
        vendorsByType: {
          local: vendorSummary.local,
          national: vendorSummary.national,
          international: vendorSummary.international
        },

        // Customer metrics
        totalCustomers: customerSummary.total,
        activeCustomers: customerSummary.active,
        customersByType: {
          individual: customerSummary.individual,
          business: customerSummary.business,
          corporate: customerSummary.corporate
        },
        totalCustomerPurchases: customerSummary.totalPurchases,
        totalOutstanding: customerSummary.totalOutstanding,

        // Employee metrics
        totalEmployees: employeeSummary.total,
        activeEmployees: employeeSummary.active,
        totalDepartments: uniqueDepartments,

        // Enhanced Purchase metrics with new workflow
        totalPurchases: purchaseSummary.total,
        totalPurchaseValue: purchaseSummary.totalValue,
        draftPurchases: purchaseSummary.draftOrders,
        approvedPurchases: purchaseSummary.approvedOrders,
        deliveredPurchases: purchaseSummary.deliveredOrders,
        invoicedPurchases: purchaseSummary.invoicedOrders,
        paidPurchases: purchaseSummary.paidOrders,
        cancelledPurchases: purchaseSummary.cancelledOrders,
        pendingPayments: purchaseSummary.pendingPayments,
        pendingRequests: purchaseSummary.pendingRequests,
        averageOrderValue: purchaseSummary.averageOrderValue
      },

      // Recent data
      latestPurchases,
      latestVendors,
      pendingPurchases,
      recentActivities,

      // Additional insights
      insights: {
        vendorGrowth: vendorSummary.total > 0 ? ((vendorSummary.active / vendorSummary.total) * 100).toFixed(1) : 0,
        customerGrowth: customerSummary.total > 0 ? ((customerSummary.active / customerSummary.total) * 100).toFixed(1) : 0,
        purchaseCompletion: purchaseSummary.total > 0 ? ((purchaseSummary.completed / purchaseSummary.total) * 100).toFixed(1) : 0,
        paymentPending: purchaseSummary.totalValue > 0 ? ((purchaseSummary.pendingPayments / purchaseSummary.totalValue) * 100).toFixed(1) : 0
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};
