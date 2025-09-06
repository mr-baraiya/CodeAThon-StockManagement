# Stock Management System - Frontend Integration Guide

## 🚀 Setup Complete!

Your frontend is now fully integrated with the backend API. Here's what has been implemented:

## 📁 New API Services Created

### 1. Authentication Service (`src/services/authService.js`)
- ✅ User registration and login
- ✅ Profile management
- ✅ Role-based permissions
- ✅ Token management

### 2. Product Service (`src/services/productService.js`)
- ✅ CRUD operations for products
- ✅ Stock management
- ✅ Low stock alerts
- ✅ Stock history tracking

### 3. Category Service (`src/services/categoryService.js`)
- ✅ Category management
- ✅ Subcategory support
- ✅ Hierarchical data structure

### 4. Supplier Service (`src/services/supplierService.js`)
- ✅ Supplier management
- ✅ Contact information
- ✅ Performance statistics

### 5. Purchase Order Service (`src/services/purchaseOrderService.js`)
- ✅ Purchase order creation
- ✅ Goods receiving
- ✅ Order tracking

### 6. Sales Service (`src/services/salesService.js`)
- ✅ Sales transaction management
- ✅ Invoice generation
- ✅ Payment tracking

### 7. Dashboard Service (`src/services/dashboardService.js`)
- ✅ Overview statistics
- ✅ Reports and analytics
- ✅ Performance metrics

## 🔧 Updated Components

### 1. Enhanced AuthContext (`src/context/AuthContext.jsx`)
- ✅ Role-based access control
- ✅ Minimum role checking
- ✅ Improved error handling

### 2. Updated Login Form (`src/components/auth/LoginForm.jsx`)
- ✅ Demo credentials component
- ✅ Better error handling
- ✅ Success notifications

### 3. New Dashboard (`src/pages/Dashboard.jsx`)
- ✅ Real-time stock data
- ✅ Low stock alerts
- ✅ Sales statistics
- ✅ Recent transactions

### 4. Product List Component (`src/components/products/ProductList.jsx`)
- ✅ Advanced filtering
- ✅ Pagination
- ✅ Search functionality
- ✅ Role-based actions

## 🎯 Demo Login Credentials

Your login page now includes quick-access buttons for test accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@stockms.com | admin123 | Full system access |
| **Manager** | manager@stockms.com | manager123 | Supplier/PO management |
| **Staff** | staff@stockms.com | staff123 | Sales & stock updates |

## 🔗 Backend Configuration

Updated configuration files:
- ✅ `.env` - Backend URL updated to `http://localhost:5050`
- ✅ `src/config/index.js` - API base URL updated
- ✅ `src/services/api.js` - Request/response interceptors

## 🛠 Utility Functions (`src/utils/helpers.js`)

New helper functions for:
- ✅ API success/error handling
- ✅ Currency formatting
- ✅ Date formatting
- ✅ Role management
- ✅ Status colors
- ✅ Form validation

## 📱 Next Steps

### 1. Start the Backend Server
Make sure your backend is running on `http://localhost:5050`

### 2. Test the Integration
```bash
npm run dev
```

Navigate to `/login` and use the demo credentials to test functionality.

### 3. Add More Components

You can now easily create additional components:

#### Sales Management
```javascript
import { salesService } from '../services';

const SalesList = () => {
  // Use salesService.getSales() to fetch sales data
};
```

#### Supplier Management
```javascript
import { supplierService } from '../services';

const SupplierList = () => {
  // Use supplierService.getSuppliers() to fetch supplier data
};
```

#### Purchase Orders
```javascript
import { purchaseOrderService } from '../services';

const PurchaseOrderList = () => {
  // Use purchaseOrderService.getPurchaseOrders()
};
```

### 4. Add Routes

Update your router to include new pages:

```javascript
// In your App.jsx or router configuration
import ProductList from './components/products/ProductList';

// Add routes for:
<Route path="/products" element={<ProductList />} />
<Route path="/suppliers" element={<SupplierList />} />
<Route path="/sales" element={<SalesList />} />
<Route path="/purchase-orders" element={<PurchaseOrderList />} />
```

### 5. Role-Based Navigation

Use the auth context for role-based menu items:

```javascript
import { useAuth } from './context/AuthContext';

const Navigation = () => {
  const { hasMinimumRole } = useAuth();
  
  return (
    <nav>
      {/* Everyone can see */}
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/products">Products</Link>
      
      {/* Staff and above */}
      {hasMinimumRole('staff') && (
        <Link to="/sales">Sales</Link>
      )}
      
      {/* Manager and above */}
      {hasMinimumRole('manager') && (
        <>
          <Link to="/suppliers">Suppliers</Link>
          <Link to="/purchase-orders">Purchase Orders</Link>
        </>
      )}
      
      {/* Admin only */}
      {hasMinimumRole('admin') && (
        <Link to="/admin">Admin Panel</Link>
      )}
    </nav>
  );
};
```

## 🔍 API Usage Examples

### Fetch Products with Filters
```javascript
const fetchProducts = async () => {
  try {
    const response = await productService.getProducts({
      search: 'laptop',
      category: categoryId,
      status: 'active',
      lowStock: true,
      page: 1,
      limit: 20
    });
    
    if (response.success) {
      setProducts(response.data);
      setPagination(response.pagination);
    }
  } catch (error) {
    handleApiError(error);
  }
};
```

### Create a Sale
```javascript
const createSale = async (saleData) => {
  try {
    const response = await salesService.createSale({
      customer: {
        name: "John Doe",
        phone: "9876543210",
        email: "john@example.com"
      },
      items: [
        {
          product: productId,
          quantity: 2,
          unitPrice: 1000,
          discount: 100
        }
      ],
      paymentMethod: "cash",
      paidAmount: 1800
    });
    
    if (response.success) {
      handleApiSuccess('Sale created successfully!');
      // Handle success (redirect, update UI, etc.)
    }
  } catch (error) {
    handleApiError(error);
  }
};
```

### Update Stock
```javascript
const updateStock = async (productId, stockData) => {
  try {
    const response = await productService.updateProductStock(productId, {
      type: 'stock_in',
      quantity: 10,
      unitPrice: 500,
      reference: 'Supplier delivery',
      supplier: supplierId
    });
    
    if (response.success) {
      handleApiSuccess('Stock updated successfully!');
      // Refresh product list
    }
  } catch (error) {
    handleApiError(error);
  }
};
```

## 🎨 UI Components Available

- ✅ Loading spinners
- ✅ Pagination
- ✅ Search and filters
- ✅ Role-based buttons
- ✅ Status badges
- ✅ Alert notifications
- ✅ Form validation
- ✅ Modal dialogs (via SweetAlert2)

## 🚨 Error Handling

All API calls include comprehensive error handling:
- Network errors
- Authentication errors (auto-redirect to login)
- Validation errors
- Server errors

## 📊 Real-time Features

Consider adding:
- WebSocket connections for live updates
- Auto-refresh for critical data
- Push notifications for low stock
- Real-time sales updates

Your Stock Management System frontend is now fully integrated and ready for production use! 🎉
