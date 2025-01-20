import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalTransactions: 0,
    totalTransactionAmount: 0,
    lastWeekUsers: 0,
    lastWeekBooks: 0,
    lastWeekTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/dashboard`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const StatCard = ({ title, value, icon, subValue, isLoading, color, previousValue }) => {
    const growth = calculateGrowth(value, previousValue);
    
    return (
      <div className="relative group">
        <div className={`bg-white rounded-2xl shadow-sm group-hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100`}>
          <div className={`px-6 py-5 ${color}`}>
            <div className="flex items-center justify-between">
              <div className={`flex-shrink-0 rounded-xl p-3 bg-white bg-opacity-20 backdrop-blur-sm`}>
                <span className="text-2xl">{icon}</span>
              </div>
              {!isLoading && subValue && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-25 text-white">
                  +{subValue} this week
                </span>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-base font-medium text-white/80">{title}</h3>
              {isLoading ? (
                <div className="h-8 w-24 bg-white/20 animate-pulse rounded mt-1"></div>
              ) : (
                <>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-bold text-white">{value}</div>
                    {growth !== 0 && (
                      <span className={`ml-2 text-sm ${growth > 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {growth > 0 ? '↑' : '↓'} {Math.abs(growth)}%
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 shadow-lg">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white opacity-10"></div>
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Welcome to HisaabKaro Dashboard</h1>
          <p className="mt-2 text-blue-100">Monitor your business metrics and activity in real-time.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          subValue={stats.lastWeekUsers}
          isLoading={loading}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
          previousValue={stats.totalUsers - stats.lastWeekUsers}
        />
        <StatCard
          title="Total Books"
          value={stats.totalBooks}
          icon="📚"
          subValue={stats.lastWeekBooks}
          isLoading={loading}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          previousValue={stats.totalBooks - stats.lastWeekBooks}
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon="💰"
          subValue={stats.lastWeekTransactions}
          isLoading={loading}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          previousValue={stats.totalTransactions - stats.lastWeekTransactions}
        />
        <StatCard
          title="Total Amount"
          value={formatCurrency(stats.totalTransactionAmount)}
          icon="₹"
          isLoading={loading}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="text-2xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Reports</h3>
          <p className="text-gray-600 mb-4">Access detailed financial reports and analytics</p>
          <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
            View Reports <span className="ml-2">→</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="text-2xl mb-4">📱</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
          <p className="text-gray-600 mb-4">View and manage user accounts and permissions</p>
          <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
            Manage Users <span className="ml-2">→</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="text-2xl mb-4">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
          <p className="text-gray-600 mb-4">Configure system settings and preferences</p>
          <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
            Open Settings <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
