import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  ShoppingCart,
  FileText,
  Plane,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/' 
    },
    { 
      id: 'vendors', 
      label: 'Vendors', 
      icon: Building2, 
      path: '/vendors' 
    },
    { 
      id: 'customers', 
      label: 'Customers', 
      icon: Users, 
      path: '/customers' 
    },
    { 
      id: 'employees', 
      label: 'Employees', 
      icon: UserCheck, 
      path: '/employees' 
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: ShoppingCart,
      path: '/purchases'
    },
    {
      id: 'hsn',
      label: 'HSN Management',
      icon: FileText,
      path: '/hsn'
    }
  ];

  return (
    <div className={`w-64 bg-white h-screen shadow-lg border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 font-inter">PRYM</h1>
              <p className="text-sm text-gray-500 font-medium">Accounts IMS</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => {
                    // Close sidebar on mobile when link is clicked
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-600'}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>PRYM-Aerospace</p>
          <p>Accounts Department</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
