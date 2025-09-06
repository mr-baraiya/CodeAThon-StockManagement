# Stock Management System API Documentation

## Overview
This API provides comprehensive stock management functionality for small stores, including inventory management, supplier management, purchase orders, sales tracking, and reporting.

## Authentication
All endpoints require authentication except where noted. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access Control
- **Staff**: Can manage stock, create sales, view products
- **Manager**: All staff permissions + can manage suppliers, purchase orders
- **Admin**: All permissions + can manage categories, users, delete records

## Base URL
```
http://localhost:5050
```

## Endpoints

### 1. User Management (/user)
- `POST /user/register` - Register new user
- `POST /user/login` - User login
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

### 2. Categories (/category)
- `GET /category` - Get all categories (public)
- `GET /category/:id` - Get category by ID
- `GET /category/:id/subcategories` - Get subcategories
- `POST /category` - Create category (Admin only)
- `PUT /category/:id` - Update category (Admin only)
- `DELETE /category/:id` - Delete category (Admin only)

### 3. Suppliers (/supplier)
- `GET /supplier` - Get all suppliers
- `GET /supplier/:id` - Get supplier by ID
- `GET /supplier/:id/stats` - Get supplier statistics
- `POST /supplier` - Create supplier (Manager/Admin only)
- `PUT /supplier/:id` - Update supplier (Manager/Admin only)
- `DELETE /supplier/:id` - Delete supplier (Manager/Admin only)

### 4. Products (/product)
- `GET /product` - Get all products with filtering
  - Query params: `status`, `category`, `supplier`, `lowStock`, `search`, `page`, `limit`
- `GET /product/low-stock` - Get low stock products
- `GET /product/:id` - Get product by ID
- `GET /product/:id/stock-history` - Get product stock history
- `PATCH /product/:id/stock` - Update product stock (Staff+)
- `POST /product` - Create product (Manager/Admin only)
- `PUT /product/:id` - Update product (Manager/Admin only)
- `DELETE /product/:id` - Delete product (Manager/Admin only)

### 5. Purchase Orders (/purchaseOrder)
- `GET /purchaseOrder` - Get all purchase orders
  - Query params: `status`, `supplier`, `dateFrom`, `dateTo`, `page`, `limit`
- `GET /purchaseOrder/:id` - Get purchase order by ID
- `PATCH /purchaseOrder/:id/receive` - Receive goods (Staff+)
- `POST /purchaseOrder` - Create purchase order (Manager/Admin only)
- `PUT /purchaseOrder/:id` - Update purchase order (Manager/Admin only)
- `PATCH /purchaseOrder/:id/cancel` - Cancel purchase order (Manager/Admin only)
- `DELETE /purchaseOrder/:id` - Delete purchase order (Manager/Admin only)

### 6. Sales (/sales)
- `GET /sales` - Get all sales
  - Query params: `status`, `paymentStatus`, `dateFrom`, `dateTo`, `customer`, `page`, `limit`
- `GET /sales/stats` - Get sales statistics
- `GET /sales/:id` - Get sale by ID
- `POST /sales` - Create new sale (Staff+)
- `PATCH /sales/:id/payment` - Record payment (Staff+)
- `PUT /sales/:id` - Update sale (Manager/Admin only)
- `PATCH /sales/:id/cancel` - Cancel sale (Manager/Admin only)

### 7. Dashboard (/dashboard)
- `GET /dashboard/overview` - Get dashboard overview
- `GET /dashboard/inventory-report` - Get inventory report
- `GET /dashboard/sales-report` - Get sales report
- `GET /dashboard/purchase-report` - Get purchase report
- `GET /dashboard/profit-loss-report` - Get profit & loss report

## Request/Response Examples

### Create Product
```http
POST /product
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Laptop Dell XPS 13",
  "sku": "DELL-XPS13-001",
  "barcode": "1234567890123",
  "description": "High-performance ultrabook",
  "category": "60f7b3b3b3b3b3b3b3b3b3b3",
  "supplier": "60f7b3b3b3b3b3b3b3b3b3b4",
  "unit": "piece",
  "costPrice": 80000,
  "sellingPrice": 95000,
  "currentStock": 10,
  "minStockLevel": 2,
  "maxStockLevel": 50,
  "reorderPoint": 5,
  "taxRate": 18
}
```

### Create Sale
```http
POST /sales
Content-Type: application/json
Authorization: Bearer <token>

{
  "customer": {
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main St, City"
  },
  "items": [
    {
      "product": "60f7b3b3b3b3b3b3b3b3b3b5",
      "quantity": 1,
      "unitPrice": 95000,
      "discount": 0,
      "taxRate": 18
    }
  ],
  "paymentMethod": "cash",
  "paidAmount": 95000,
  "notes": "Cash sale"
}
```

### Update Stock
```http
PATCH /product/60f7b3b3b3b3b3b3b3b3b3b5/stock
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "stock_in",
  "quantity": 5,
  "unitPrice": 80000,
  "reference": "Manual adjustment",
  "notes": "Stock replenishment"
}
```

## Error Responses
All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

## Success Responses
All endpoints return consistent success responses:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

## Pagination
List endpoints support pagination:
```json
{
  "success": true,
  "data": [/* array of items */],
  "pagination": {
    "current": 1,
    "total": 10,
    "count": 20,
    "totalRecords": 200
  }
}
```

## Features Implemented

### ✅ Core Features
- [x] User & Role Management (Staff, Manager, Admin)
- [x] Product & Category Management
- [x] Stock Control (In/Out, Adjustments, Low Stock Alerts)
- [x] Supplier & Purchase Management
- [x] Bill/Invoice Management
- [x] Reporting & Analytics
- [x] Dashboard with Key Metrics

### ✅ Stock Management
- [x] Real-time stock tracking
- [x] Low stock alerts
- [x] Stock transaction history
- [x] Batch and expiry tracking (optional fields)
- [x] Multiple warehouse locations

### ✅ Purchase Orders
- [x] Create and manage purchase orders
- [x] Goods receipt functionality
- [x] Partial receiving support
- [x] Automatic stock updates

### ✅ Sales & Invoicing
- [x] Generate invoices with auto-numbering
- [x] Discount and tax management
- [x] Payment tracking
- [x] Customer information management

### ✅ Reporting
- [x] Inventory reports
- [x] Sales reports
- [x] Purchase reports
- [x] Profit & Loss reports
- [x] Dashboard analytics

### 🔄 Future Enhancements
- [ ] Barcode scanner integration
- [ ] Export to CSV/Excel/PDF
- [ ] Email notifications
- [ ] Cloud backup
- [ ] Multi-device sync
- [ ] Advanced analytics

## Database Models

### Product
- Basic info (name, SKU, barcode, description)
- Category and supplier relationships
- Pricing (cost, selling, tax rate)
- Stock levels (current, min, max, reorder point)
- Location and batch information

### Category
- Hierarchical structure (categories/subcategories)
- Name, description, image

### Supplier
- Contact information
- Address details
- Payment terms
- GST information

### Purchase Order
- Auto-generated order numbers
- Supplier relationship
- Items with quantities and pricing
- Status tracking
- Receiving functionality

### Sales
- Auto-generated invoice numbers
- Customer information
- Items with pricing and taxes
- Payment tracking
- Status management

### Stock Transaction
- Complete audit trail
- Transaction types (in/out/adjustment/purchase/sale)
- Reference tracking
- User accountability

This API provides a complete stock management solution suitable for small stores with room for future enhancements.
