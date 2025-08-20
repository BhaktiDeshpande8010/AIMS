import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { AdminRoute, AccountsRoute } from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './components/AdminLayout';

// Auth pages
import Login from './pages/auth/Login';

// Accounts pages
import Dashboard from './pages/Dashboard';
import Vendors from './pages/vendors/Vendors';
import Customers from './pages/customers/Customers';
import Employees from './pages/employees/Employees';
import EmployeeDetailView from './pages/employees/EmployeeDetailView';
import Purchases from './pages/purchases/Purchases';
import OrderDetails from './pages/orders/OrderDetails';
import HSN from './pages/hsn/HSN';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  {/* Add more admin routes here */}
                </Routes>
              </AdminLayout>
            </AdminRoute>
          } />

          {/* Accounts routes with sidebar layout */}
          <Route element={
            <AccountsRoute>
              <MainLayout />
            </AccountsRoute>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/hsn" element={<HSN />} />
          </Route>

          {/* Detail pages without sidebar (protected) */}
          <Route path="/employees/:id" element={
            <AccountsRoute>
              <EmployeeDetailView />
            </AccountsRoute>
          } />
          <Route path="/orders/:id" element={
            <AccountsRoute>
              <OrderDetails />
            </AccountsRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
