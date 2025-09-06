import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productService, categoryService } from '../../services';
import { formatCurrency, handleApiError, getStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  TagIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const StaffProductView = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">
            View product inventory (Read-only access)
          </p>
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Staff Access: View Only
            </span>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

            {/* Low Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Filter
              </label>
              <div className="flex items-center pt-2">
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
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2">
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
                  {/* Product Cards */}
                  <div className="divide-y divide-gray-200">
                    {products.map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => setSelectedProduct(product)}
                        className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                          selectedProduct?._id === product._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 font-medium">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{product.name}</h3>
                              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                              <p className="text-xs text-gray-400">
                                {product.category?.name || 'No Category'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
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
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                              {product.status}
                            </span>
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
                    <CubeIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or search terms.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Product Details Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8"
            >
              {selectedProduct ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Product Image Placeholder */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-gray-400">
                      {selectedProduct.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">{selectedProduct.name}</h4>
                      <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
                      {selectedProduct.barcode && (
                        <p className="text-sm text-gray-600">Barcode: {selectedProduct.barcode}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="flex items-center space-x-2">
                      <TagIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedProduct.category?.name || 'No Category'}
                      </span>
                    </div>

                    {/* Supplier */}
                    {selectedProduct.supplier && (
                      <div className="flex items-center space-x-2">
                        <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedProduct.supplier.name}
                        </span>
                      </div>
                    )}

                    {/* Stock Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Stock Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Stock:</span>
                          <span className={`font-medium ${
                            selectedProduct.isLowStock ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {selectedProduct.currentStock} {selectedProduct.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Level:</span>
                          <span className="text-gray-900">{selectedProduct.minStockLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Level:</span>
                          <span className="text-gray-900">{selectedProduct.maxStockLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reorder Point:</span>
                          <span className="text-gray-900">{selectedProduct.reorderPoint}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Pricing (View Only)</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost Price:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedProduct.costPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Selling Price:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(selectedProduct.sellingPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profit Margin:</span>
                          <span className="font-medium text-green-600">
                            {selectedProduct.profitMargin}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax Rate:</span>
                          <span className="text-gray-900">{selectedProduct.taxRate}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedProduct.description && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                        <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedProduct.status)}`}>
                        {selectedProduct.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <EyeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Product
                  </h3>
                  <p className="text-gray-500">
                    Click on a product to view its details
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

export default StaffProductView;
