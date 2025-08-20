import React from 'react';
import { Search, User, Menu } from 'lucide-react';

const Topbar = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 fixed top-0 right-0 left-0 lg:left-64 lg:w-[calc(100%-16rem)] z-40 backdrop-blur-sm bg-white/95 lg:bg-transparent">
      {/* Mobile menu button */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-lg ml-4 lg:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search vendors, customers, orders..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:bg-white transition-all duration-200 text-sm placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center">
        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 lg:hidden">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Accounts Manager</p>
            <p className="text-xs text-gray-500">accounts@agridrone.com</p>
          </div>
          <button
            className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm"
            aria-label="User menu"
          >
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
