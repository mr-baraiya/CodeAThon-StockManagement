import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { productService, supplierService } from '../../services';
import { handleApiSuccess, handleApiError, formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  CubeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const StaffStockManagement = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockAction, setStockAction] = useState('stock_in'); // stock_in or stock_out

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const watchQuantity = watch('quantity', 0);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts({
        status: 'active',
        search: searchTerm,
        limit: 50
      });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      handleApiError(error, 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getSuppliers({ status: 'active' });
      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedProduct) {
      handleApiError({ message: 'Please select a product first' });
      return;
    }

    try {
      const stockData = {
        type: stockAction,
        quantity: parseInt(data.quantity),
        unitPrice: data.unitPrice ? parseFloat(data.unitPrice) : selectedProduct.costPrice,
        reference: data.reference || `${stockAction === 'stock_in' ? 'Stock In' : 'Stock Out'} by Staff`,
        notes: data.notes,
        ...(stockAction === 'stock_in' && data.supplier && { supplier: data.supplier })
      };

      const response = await productService.updateProductStock(selectedProduct._id, stockData);
      
      if (response.success) {
        handleApiSuccess(
          `Stock ${stockAction === 'stock_in' ? 'added' : 'removed'} successfully! 
          New stock: ${response.data.newStock} ${selectedProduct.unit}`
        );
        
        // Update the product in local state
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === selectedProduct._id 
              ? { ...product, currentStock: response.data.newStock }
              : product
          )
        );
        
        // Update selected product
        setSelectedProduct(prev => ({ ...prev, currentStock: response.data.newStock }));
        
        // Reset form
        reset();
      }
    } catch (error) {
      handleApiError(error, 'Failed to update stock');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">
            Stock Management
          </h1>
          <p className="text-gray-600 mt-2">
            Update stock levels - Stock In/Out only
          </p>
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Staff Access: Stock Updates Only
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Select Product
            </h2>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedProduct?._id === product._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                      <p className="text-xs text-gray-500">
                        Category: {product.category?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        product.isLowStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.currentStock} {product.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Min: {product.minStockLevel}
                      </p>
                      {product.isLowStock && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stock Update Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Update Stock
            </h2>

            {selectedProduct ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Selected Product Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
                  <p className="text-sm text-gray-600">
                    Current Stock: <span className="font-medium">{selectedProduct.currentStock} {selectedProduct.unit}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Cost Price: <span className="font-medium">{formatCurrency(selectedProduct.costPrice)}</span>
                  </p>
                </div>

                {/* Stock Action */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Stock Action
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStockAction('stock_in')}
                      className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition-all ${
                        stockAction === 'stock_in'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Stock In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockAction('stock_out')}
                      className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition-all ${
                        stockAction === 'stock_out'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <MinusIcon className="w-5 h-5" />
                      <span>Stock Out</span>
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register('quantity', { 
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity"
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                  )}
                </div>

                {/* Unit Price (for stock in) */}
                {stockAction === 'stock_in' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('unitPrice')}
                      placeholder={`Default: ${formatCurrency(selectedProduct.costPrice)}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Supplier (for stock in) */}
                {stockAction === 'stock_in' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier (Optional)
                    </label>
                    <select
                      {...register('supplier')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference
                  </label>
                  <input
                    type="text"
                    {...register('reference')}
                    placeholder={`${stockAction === 'stock_in' ? 'Purchase Order, Delivery' : 'Sale, Damage, Return'}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows="3"
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Preview */}
                {watchQuantity > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Preview:</h4>
                    <p className="text-sm text-blue-800">
                      Current Stock: {selectedProduct.currentStock} {selectedProduct.unit}
                    </p>
                    <p className="text-sm text-blue-800">
                      {stockAction === 'stock_in' ? 'After Stock In' : 'After Stock Out'}: {' '}
                      <span className="font-medium">
                        {stockAction === 'stock_in' 
                          ? selectedProduct.currentStock + parseInt(watchQuantity || 0)
                          : selectedProduct.currentStock - parseInt(watchQuantity || 0)
                        } {selectedProduct.unit}
                      </span>
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                    stockAction === 'stock_in'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {stockAction === 'stock_in' ? 'Add Stock' : 'Remove Stock'}
                </button>
              </form>
            ) : (
              <div className="text-center py-12">
                <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Product
                </h3>
                <p className="text-gray-500">
                  Choose a product from the list to update its stock level
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StaffStockManagement;
