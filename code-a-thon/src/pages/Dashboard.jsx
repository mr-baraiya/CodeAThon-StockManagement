import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { dashboardService, productService } from '../services';
import { formatCurrency, formatDate, handleApiError } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  CubeIcon,
  CurrencyRupeeIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, hasMinimumRole } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchLowStockProducts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getDashboardOverview();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      handleApiError(error, 'Failed to load dashboard data');
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await productService.getLowStockProducts();
      if (response.success) {
        setLowStockProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to load low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Products',
      value: dashboardData?.stockSummary?.totalProducts || 0,
      icon: CubeIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Stock Value',
      value: formatCurrency(dashboardData?.stockSummary?.totalValue || 0),
      icon: CurrencyRupeeIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: "Today's Sales",
      value: dashboardData?.todaySales?.totalSales || 0,
      icon: ShoppingCartIcon,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Low Stock Alert',
      value: dashboardData?.stockSummary?.lowStockCount || 0,
      icon: ExclamationTriangleIcon,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    }
  ];

  if (hasMinimumRole('manager')) {
    statsCards.push(
      {
        title: 'Pending POs',
        value: dashboardData?.pendingPurchaseOrders || 0,
        icon: TruckIcon,
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        borderColor: 'border-yellow-200'
      },
      {
        title: "Today's Revenue",
        value: formatCurrency(dashboardData?.todaySales?.totalRevenue || 0),
        icon: ChartBarIcon,
        color: 'indigo',
        bgColor: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
        borderColor: 'border-indigo-200'
      }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your stock management system today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`${card.bgColor} ${card.borderColor} border-2 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Alert */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-2" />
                Low Stock Alert
              </h2>
              {lowStockProducts.length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {lowStockProducts.length} items
                </span>
              )}
            </div>

            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {product.currentStock} left
                      </p>
                      <p className="text-xs text-gray-500">
                        Min: {product.minStockLevel}
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{lowStockProducts.length - 5} more items need restocking
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">All products are well stocked!</p>
              </div>
            )}
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ChartBarIcon className="w-6 h-6 text-blue-500 mr-2" />
                Recent Transactions
              </h2>
            </div>

            {dashboardData?.recentTransactions?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.product?.name}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.transactionType === 'sale' ? 'Sale' : 'Stock Update'} by {transaction.performedBy?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.transactionType === 'sale' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.transactionType === 'sale' ? '-' : '+'}{transaction.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent transactions</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Selling Products */}
        {dashboardData?.topSellingProducts?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BuildingStorefrontIcon className="w-6 h-6 text-green-500 mr-2" />
                Top Selling Products
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.topSellingProducts.slice(0, 6).map((product, index) => (
                <div key={product._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{product.productName}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">SKU: {product.sku}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sold: {product.totalQuantity}</span>
                    <span className="font-medium text-green-600">{formatCurrency(product.totalRevenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
