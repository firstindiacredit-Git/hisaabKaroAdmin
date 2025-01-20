import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: '📊', path: '/' },
    { text: 'Users', icon: '👥', path: '/users' },
    { text: 'Books', icon: '📚', path: '/books' },
    { text: 'Transactions', icon: '💰', path: '/transactions' },
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-40 lg:hidden`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"></div>
        <div className="fixed inset-0 flex z-40">
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <span className="text-white text-2xl">×</span>
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center px-6">
              <h1 className="text-2xl font-bold text-indigo-600">HisaabKaro</h1>
            </div>
            <div className="mt-8 flex-1 h-0 overflow-y-auto">
              <nav className="px-3 space-y-1">
                {menuItems.map((item) => (
                  <a
                    key={item.text}
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg cursor-pointer transition-colors duration-150 ${
                      isActivePath(item.path)
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-4 text-xl">{item.icon}</span>
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto shadow-lg">
          <div className="flex items-center flex-shrink-0 px-6">
            <h1 className="text-2xl font-bold text-indigo-600">HisaabKaro</h1>
          </div>
          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-3 space-y-1">
              {menuItems.map((item) => (
                <a
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg cursor-pointer transition-colors duration-150 ${
                    isActivePath(item.path)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <span className="text-2xl">☰</span>
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {menuItems.find(item => isActivePath(item.path))?.text || 'Dashboard'}
              </h1>
            </div>
          </div>
        </div>
        <main className="flex-1 pb-8">
          <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
