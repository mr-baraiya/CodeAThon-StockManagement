import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { salesService, dashboardService } from '../../services';
import { formatCurrency, formatDate, handleApiError } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';
import { 
  ChartBarIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  ShoppingCartIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const StaffSalesReports = () => {
  const [salesData, setSalesData] = useState([]);
  const [dailyStats, setDailyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0], // Today only
    paymentMethod: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchDailySales();
    fetchDailyStats();
  }, [filters]);

  const fetchDailySales = async () => {
    setLoading(true);
    try {
      const response = await salesService.getSales({
        ...filters,
        startDate: filters.date,
        endDate: filters.date
      });
      
      if (response.success) {
        setSalesData(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      handleApiError(error, 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const startDate = new Date(filters.date);
      const endDate = new Date(filters.date);
      
      const response = await dashboardService.getSalesStats({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      if (response.success) {
        setDailyStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load daily stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getSaleStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'upi':
        return '📱';
      default:
        return '💰';
    }
  };

  const isToday = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-gray-600 mt-2">View daily sales reports and statistics</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Staff Access: Daily Reports Only
            </span>
            <span className="text-sm text-gray-500">
              No export or historical data access
            </span>
          </div>
        </motion.div>

        {/* Staff Limitations Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Staff Report Access</h3>
              <p className="text-sm text-blue-700 mt-1">
                As a staff member, you can view today's sales data only. For historical reports or data export, please contact your manager.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Filter (Limited to Today) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date (Today Only)
              </label>
              <div className="relative">
                <CalendarDaysIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="date"
                  value={filters.date}
                  max={new Date().toISOString().split('T')[0]}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Staff can only view today's reports
              </p>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters(prev => ({ ...prev, paymentMethod: '', page: 1 }))}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Daily Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dailyStats.totalSales || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailyStats.totalOrders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dailyStats.averageOrderValue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailyStats.totalItems || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">📦</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Today's Sales</h3>
                <p className="text-sm text-gray-600">
                  {isToday(filters.date) ? 'Live updates' : 'Historical data (limited access)'}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : salesData.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-200">
                    {salesData.map((sale, index) => (
                      <motion.div
                        key={sale._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => setSelectedSale(sale)}
                        className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                          selectedSale?._id === sale._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-lg">{getPaymentMethodIcon(sale.paymentMethod)}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Sale #{sale.invoiceNumber || sale._id.slice(-6)}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <ClockIcon className="w-4 h-4" />
                                <span>{formatDate(sale.createdAt, 'time')}</span>
                                {sale.customer && (
                                  <>
                                    <span>•</span>
                                    <UserIcon className="w-4 h-4" />
                                    <span>{sale.customer.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-lg font-semibold text-gray-900">
                                {formatCurrency(sale.total)}
                              </span>
                              {sale.staffGenerated && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  Staff
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSaleStatusColor(sale.status)}`}>
                                {sale.status}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {sale.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.total > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <Pagination
                        currentPage={pagination.current}
                        totalPages={pagination.total}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                  <p className="text-gray-500">
                    {isToday(filters.date) ? 'No sales made today yet.' : 'No sales found for the selected date.'}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sale Details Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8"
            >
              {selectedSale ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Sale Details</h3>
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Sale Information */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Sale #{selectedSale.invoiceNumber || selectedSale._id.slice(-6)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedSale.createdAt, 'full')}
                      </p>
                      {selectedSale.staffGenerated && (
                        <span className="inline-flex mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Generated by Staff
                        </span>
                      )}
                    </div>

                    {/* Customer Info */}
                    {selectedSale.customer && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium text-gray-900 mb-2">Customer</h5>
                        <p className="text-sm text-gray-700">{selectedSale.customer.name}</p>
                        <p className="text-sm text-gray-600">{selectedSale.customer.email}</p>
                        <p className="text-sm text-gray-600">{selectedSale.customer.phone}</p>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Items ({selectedSale.items?.length})</h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedSale.items?.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <div>
                              <p className="text-gray-900">{item.product?.name || 'Product'}</p>
                              <p className="text-gray-500">{item.quantity} × {formatCurrency(item.price)}</p>
                            </div>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(item.quantity * item.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Payment Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-gray-900">{formatCurrency(selectedSale.subtotal)}</span>
                        </div>
                        {selectedSale.tax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span className="text-gray-900">{formatCurrency(selectedSale.tax)}</span>
                          </div>
                        )}
                        {selectedSale.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-{formatCurrency(selectedSale.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium border-t pt-2">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-green-600">{formatCurrency(selectedSale.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method & Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <span className="text-sm text-gray-600">Payment:</span>
                        <span className="ml-2 text-sm font-medium capitalize">
                          {getPaymentMethodIcon(selectedSale.paymentMethod)} {selectedSale.paymentMethod}
                        </span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSaleStatusColor(selectedSale.status)}`}>
                        {selectedSale.status}
                      </span>
                    </div>

                    {/* Notes */}
                    {selectedSale.notes && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          {selectedSale.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Limited Actions for Staff */}
                  <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">Limited Access</p>
                        <p className="text-xs text-amber-700 mt-1">
                          As staff, you can view sale details but cannot modify, refund, or export data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <EyeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Sale
                  </h3>
                  <p className="text-gray-500">
                    Click on a sale to view its details
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSalesReports;
