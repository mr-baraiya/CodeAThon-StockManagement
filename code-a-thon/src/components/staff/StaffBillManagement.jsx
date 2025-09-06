import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productService, salesService, customerService } from '../../services';
import { formatCurrency, handleApiError, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CalculatorIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const StaffBillManagement = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [notes, setNotes] = useState('');
  const [printPreview, setPrintPreview] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Staff restrictions
  const MAX_DISCOUNT_PERCENTAGE = 5; // Staff can only give up to 5% discount
  const MAX_DISCOUNT_AMOUNT = 100; // Or max ₹100 fixed discount

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts({
        status: 'active',
        limit: 100
      });
      if (response.success) {
        setProducts(response.data.filter(p => p.currentStock > 0));
      }
    } catch (error) {
      handleApiError(error, 'Failed to load products');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getCustomers({ limit: 100 });
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.barcode && product.barcode.includes(productSearch))
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.phone && customer.phone.includes(customerSearch))
  );

  const addProductToBill = (product) => {
    const existingItem = billItems.find(item => item.product._id === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        setErrors(prev => ({
          ...prev,
          [`product_${product._id}`]: 'Insufficient stock'
        }));
        return;
      }
      updateItemQuantity(product._id, existingItem.quantity + 1);
    } else {
      const newItem = {
        id: Date.now(),
        product,
        quantity: 1,
        price: product.sellingPrice,
        tax: product.taxRate || 0,
        subtotal: product.sellingPrice
      };
      setBillItems(prev => [...prev, newItem]);
    }
    setProductSearch('');
    setErrors(prev => ({ ...prev, [`product_${product._id}`]: null }));
  };

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromBill(productId);
      return;
    }

    setBillItems(prev => prev.map(item => {
      if (item.product._id === productId) {
        const maxQuantity = item.product.currentStock;
        const quantity = Math.min(newQuantity, maxQuantity);
        const subtotal = quantity * item.price;
        
        if (newQuantity > maxQuantity) {
          setErrors(prevErrors => ({
            ...prevErrors,
            [`product_${productId}`]: 'Insufficient stock'
          }));
        } else {
          setErrors(prevErrors => ({
            ...prevErrors,
            [`product_${productId}`]: null
          }));
        }
        
        return {
          ...item,
          quantity,
          subtotal
        };
      }
      return item;
    }));
  };

  const removeItemFromBill = (productId) => {
    setBillItems(prev => prev.filter(item => item.product._id !== productId));
    setErrors(prev => ({ ...prev, [`product_${productId}`]: null }));
  };

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = billItems.reduce((sum, item) => sum + (item.subtotal * item.tax / 100), 0);
    
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * Math.min(discount.value, MAX_DISCOUNT_PERCENTAGE)) / 100;
    } else {
      discountAmount = Math.min(discount.value, MAX_DISCOUNT_AMOUNT);
    }
    
    const total = subtotal + totalTax - discountAmount;
    
    return {
      subtotal,
      totalTax,
      discountAmount,
      total: Math.max(total, 0)
    };
  };

  const validateDiscount = (type, value) => {
    if (type === 'percentage' && value > MAX_DISCOUNT_PERCENTAGE) {
      setErrors(prev => ({
        ...prev,
        discount: `Staff discount limited to ${MAX_DISCOUNT_PERCENTAGE}%`
      }));
      return false;
    }
    if (type === 'amount' && value > MAX_DISCOUNT_AMOUNT) {
      setErrors(prev => ({
        ...prev,
        discount: `Staff discount limited to ₹${MAX_DISCOUNT_AMOUNT}`
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, discount: null }));
    return true;
  };

  const handleDiscountChange = (type, value) => {
    if (validateDiscount(type, value)) {
      setDiscount({ type, value: Math.max(0, value) });
    }
  };

  const validateBill = () => {
    const newErrors = {};
    
    if (billItems.length === 0) {
      newErrors.items = 'Add at least one item to the bill';
    }
    
    billItems.forEach(item => {
      if (item.quantity > item.product.currentStock) {
        newErrors[`product_${item.product._id}`] = 'Insufficient stock';
      }
    });
    
    if (!validateDiscount(discount.type, discount.value)) {
      newErrors.discount = 'Invalid discount value';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateBill = async () => {
    if (!validateBill()) {
      return;
    }

    setSubmitting(true);
    try {
      const totals = calculateTotals();
      
      const billData = {
        customer: selectedCustomer ? selectedCustomer._id : null,
        items: billItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          tax: item.tax
        })),
        subtotal: totals.subtotal,
        tax: totals.totalTax,
        discount: totals.discountAmount,
        total: totals.total,
        paymentMethod,
        notes,
        staffGenerated: true
      };

      const response = await salesService.createSale(billData);
      
      if (response.success) {
        setPrintPreview(true);
        // Reset form after successful bill generation
        setTimeout(() => {
          setBillItems([]);
          setSelectedCustomer(null);
          setDiscount({ type: 'percentage', value: 0 });
          setNotes('');
          setPrintPreview(false);
        }, 5000);
      }
    } catch (error) {
      handleApiError(error, 'Failed to generate bill');
    } finally {
      setSubmitting(false);
    }
  };

  const resetBill = () => {
    setBillItems([]);
    setSelectedCustomer(null);
    setDiscount({ type: 'percentage', value: 0 });
    setNotes('');
    setErrors({});
    setPrintPreview(false);
  };

  const totals = calculateTotals();

  if (printPreview) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white p-8"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Bill Generated Successfully!</h2>
            <p className="text-gray-600">Invoice #{Date.now()}</p>
          </div>

          {/* Invoice Preview */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-gray-600">Generated by Staff</p>
            </div>

            {selectedCustomer && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <p className="text-gray-700">{selectedCustomer.name}</p>
                <p className="text-gray-600">{selectedCustomer.email}</p>
                <p className="text-gray-600">{selectedCustomer.phone}</p>
              </div>
            )}

            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.product.name}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(item.price)}</td>
                    <td className="text-right py-2">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(totals.totalTax)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Payment Method: {paymentMethod.toUpperCase()}</p>
              <p>Date: {formatDate(new Date())}</p>
              {notes && <p>Notes: {notes}</p>}
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <PrinterIcon className="w-5 h-5" />
              <span>Print</span>
            </button>
            <button
              onClick={resetBill}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              New Bill
            </button>
          </div>
        </div>
      </motion.div>
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
          <h1 className="text-3xl font-bold text-gray-900">Bill Management</h1>
          <p className="text-gray-600 mt-2">Generate invoices and sales bills</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Staff Access: Limited Discounts
            </span>
            <span className="text-sm text-amber-600">
              Max Discount: {MAX_DISCOUNT_PERCENTAGE}% or ₹{MAX_DISCOUNT_AMOUNT}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Products</h3>
              
              {/* Product Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Product List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => addProductToBill(product)}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                        <p className="text-sm text-green-600">{formatCurrency(product.sellingPrice)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">
                          {product.currentStock} {product.unit}
                        </span>
                        {product.isLowStock && (
                          <p className="text-xs text-red-500">Low Stock</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Customer Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer (Optional)</h3>
              
              {selectedCustomer ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedCustomer.name}</h4>
                      <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                      <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative mb-4">
                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                      >
                        <h4 className="font-medium text-gray-900">{customer.name}</h4>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Bill Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Items</h3>
              
              {errors.items && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.items}
                </div>
              )}

              {billItems.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {billItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.subtotal)}
                          </p>
                          {errors[`product_${item.product._id}`] && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors[`product_${item.product._id}`]}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateItemQuantity(item.product._id, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(item.product._id, item.quantity + 1)}
                              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItemFromBill(item.product._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Discount Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <TicketIcon className="w-5 h-5 mr-2" />
                      Discount (Staff Limited)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <select
                          value={discount.type}
                          onChange={(e) => setDiscount(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="amount">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          max={discount.type === 'percentage' ? MAX_DISCOUNT_PERCENTAGE : MAX_DISCOUNT_AMOUNT}
                          value={discount.value}
                          onChange={(e) => handleDiscountChange(discount.type, parseFloat(e.target.value) || 0)}
                          placeholder={discount.type === 'percentage' ? `Max ${MAX_DISCOUNT_PERCENTAGE}%` : `Max ₹${MAX_DISCOUNT_AMOUNT}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="text-sm text-gray-600 pt-2">
                        Discount: {formatCurrency(totals.discountAmount)}
                      </div>
                    </div>
                    
                    {errors.discount && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
                          <span className="text-amber-700 text-sm">{errors.discount}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Payment Method</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {['cash', 'card', 'upi'].map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 border rounded-lg text-center capitalize transition-colors duration-200 ${
                            paymentMethod === method
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Notes (Optional)</h4>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes for this bill..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="space-y-2 text-right">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">{formatCurrency(totals.totalTax)}</span>
                      </div>
                      {totals.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span className="font-medium">-{formatCurrency(totals.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={generateBill}
                      disabled={submitting || billItems.length === 0}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {submitting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <CalculatorIcon className="w-5 h-5" />
                          <span>Generate Bill</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetBill}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Reset
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <CalculatorIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items added</h3>
                  <p className="text-gray-500">
                    Search and select products to add them to the bill
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

export default StaffBillManagement;
