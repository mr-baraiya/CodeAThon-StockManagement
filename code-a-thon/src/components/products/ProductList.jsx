import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { productService, categoryService } from '../../services';
import { formatCurrency, handleApiError, getStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ProductList = () => {
  const { hasMinimumRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'active',
    lowStock: false,
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(filters);
      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      handleApiError(error, 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: 'active',
      lowStock: false,
      page: 1,
      limit: 20,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">
              Manage your product inventory
            </p>
          </div>
          
          {hasMinimumRole('manager') && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Product</span>
            </motion.button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, or barcode..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
                <option value="all">All Status</option>
              </select>
            </div>

            {/* Low Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Filter
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lowStock"
                  checked={filters.lowStock}
                  onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="lowStock" className="ml-2 text-sm text-gray-700">
                  Low Stock Only
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-end space-x-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        {/* Products Grid/Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-2">Product</div>
                  <div>Category</div>
                  <div>Stock</div>
                  <div>Cost Price</div>
                  <div>Selling Price</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-8 gap-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 font-medium">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <span className="text-sm text-gray-900">
                          {product.category?.name || 'N/A'}
                        </span>
                      </div>

                      {/* Stock */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            product.isLowStock ? 'text-red-600' : 
                            product.isOutOfStock ? 'text-red-800' : 'text-gray-900'
                          }`}>
                            {product.currentStock} {product.unit}
                          </span>
                          {product.isLowStock && (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Min: {product.minStockLevel}
                        </p>
                      </div>

                      {/* Cost Price */}
                      <div>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(product.costPrice)}
                        </span>
                      </div>

                      {/* Selling Price */}
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.sellingPrice)}
                        </span>
                        <p className="text-xs text-green-600">
                          {product.profitMargin}% margin
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {hasMinimumRole('manager') && (
                            <>
                              <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AdjustmentsHorizontalIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductList;
