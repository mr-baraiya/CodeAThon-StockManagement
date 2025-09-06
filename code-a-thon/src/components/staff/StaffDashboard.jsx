import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { productService, salesService } from '../../services';
import { formatCurrency, formatDate, handleApiError } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import StaffNavigation from './StaffNavigation';
import {
  CubeIcon,
  CurrencyRupeeIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: { count: 0, revenue: 0 },
    lowStock: []
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Load today's sales data
      const salesResponse = await salesService.getSales({ date: today });
      const todaySales = salesResponse.data || [];
      
      const todayStats = {
        count: todaySales.length,
        revenue: todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0)
      };

      // Load low stock products
      const productsResponse = await productService.getProducts({ limit: 100 });
      const allProducts = productsResponse.data || [];
      const lowStockProducts = allProducts
        .filter(product => product.quantity <= (product.minStockLevel || 10))
        .slice(0, 5); // Show only top 5 low stock items

      setStats({
        todaySales: todayStats,
        lowStock: lowStockProducts
      });
    } catch (error) {
      console.error('Error loading staff dashboard data:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading staff dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {user?.name || 'Staff Member'}
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <CalendarDaysIcon className="w-4 h-4 mr-1" />
                  {formatDate(new Date())}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm font-medium">Staff Access Level</p>
                <p className="text-blue-600 text-xs">Limited permissions active</p>
              </div>
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Panel */}
          <div className="lg:col-span-1">
            <StaffNavigation />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Today's Sales Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Sales Count */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingCartIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todaySales.count}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Live updates
                    </p>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyRupeeIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.todaySales.revenue)}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Real-time
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Low Stock Alert */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
                  <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {stats.lowStock.length} items
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Products requiring immediate attention</p>
              </div>

              <div className="p-6">
                {stats.lowStock.length > 0 ? (
                  <div className="space-y-3">
                    {stats.lowStock.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <CubeIcon className="w-5 h-5 text-orange-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-orange-600">
                            {product.quantity} units left
                          </p>
                          <p className="text-xs text-gray-500">
                            Min: {product.minStockLevel || 10}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CubeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">All products are adequately stocked</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Staff Permissions Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Your Access Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">✅ You can:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• View and search products</li>
                    <li>• Generate customer invoices</li>
                    <li>• Apply limited discounts (5% or ₹100)</li>
                    <li>• View today's sales reports</li>
                    <li>• Manage stock in/out operations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">❌ Restricted:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Create or edit products</li>
                    <li>• Access historical reports</li>
                    <li>• Export data or reports</li>
                    <li>• Manage users or suppliers</li>
                    <li>• Modify system settings</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
