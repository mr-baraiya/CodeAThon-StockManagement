# Stock Management System - Complete API Documentation

## Base URL
```
http://localhost:9705
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Get token by logging in first, then use it for subsequent requests.

---

## 📋 Complete API Endpoints List

### 🔐 Authentication & User Management

#### 1. User Registration
```http
POST /user/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "location": "Main Store",
  "role": "staff"  // Optional: staff, manager, admin (default: staff)
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "64f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "staff",
    "location": "Main Store",
    "phone": "9876543210",
    "status": "active",
    "createdAt": "2025-09-06T10:30:00.000Z"
  }
}
```

#### 2. User Login
```http
POST /user/login
Content-Type: application/json

Body:
{
  "email": "admin@stockms.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f7b3b3b3b3b3b3b3b3b3b3",
    "name": "System Administrator",
    "email": "admin@stockms.com",
    "role": "admin"
  }
}
```

#### 3. Get User Profile
```http
GET /user/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "64f7b3b3b3b3b3b3b3b3b3b3",
    "name": "System Administrator",
    "email": "admin@stockms.com",
    "role": "admin",
    "location": "Head Office",
    "phone": "9999999999",
    "status": "active",
    "createdAt": "2025-09-06T10:30:00.000Z"
  }
}
```

#### 4. Update User Profile
```http
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Updated Name",
  "phone": "9876543210",
  "location": "New Location"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

### 📦 Category Management

#### 5. Get All Categories (Public)
```http
GET /category?status=active&includeSubcategories=true

Query Parameters:
- status: active|inactive|all (default: active)
- includeSubcategories: true|false (default: true)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "parentCategory": null,
      "status": "active",
      "subcategories": [
        {
          "_id": "64f7b3b3b3b3b3b3b3b3b3b4",
          "name": "Laptops",
          "description": "Laptop computers",
          "parentCategory": "64f7b3b3b3b3b3b3b3b3b3b3"
        }
      ],
      "createdAt": "2025-09-06T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

#### 6. Get Category by ID
```http
GET /category/64f7b3b3b3b3b3b3b3b3b3b3

Response:
{
  "success": true,
  "data": {
    "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "parentCategory": null,
    "status": "active",
    "subcategories": [...],
    "createdAt": "2025-09-06T10:30:00.000Z"
  }
}
```

#### 7. Create Category (Admin Only)
```http
POST /category
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "name": "New Category",
  "description": "Category description",
  "parentCategory": "64f7b3b3b3b3b3b3b3b3b3b3", // Optional for subcategory
  "image": "https://example.com/image.jpg"       // Optional
}

Response:
{
  "success": true,
  "message": "Category created successfully",
  "data": { /* created category */ }
}
```

#### 8. Update Category (Admin Only)
```http
PUT /category/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "status": "active"
}

Response:
{
  "success": true,
  "message": "Category updated successfully",
  "data": { /* updated category */ }
}
```

#### 9. Delete Category (Admin Only)
```http
DELETE /category/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Category deleted successfully"
}
```

#### 10. Get Subcategories
```http
GET /category/64f7b3b3b3b3b3b3b3b3b3b3/subcategories

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Laptops",
      "description": "Laptop computers",
      "parentCategory": "64f7b3b3b3b3b3b3b3b3b3b3"
    }
  ],
  "count": 1
}
```

---

### 🏪 Supplier Management

#### 11. Get All Suppliers
```http
GET /supplier?status=active&search=tech&page=1&limit=10
Authorization: Bearer <token>

Query Parameters:
- status: active|inactive|all (default: active)
- search: search in name, contact person, phone
- page: page number (default: 1)
- limit: items per page (default: 10)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Tech Solutions Pvt Ltd",
      "contactPerson": "Rajesh Kumar",
      "email": "rajesh@techsolutions.com",
      "phone": "9876543210",
      "address": {
        "street": "123 Tech Park",
        "city": "Bangalore",
        "state": "Karnataka",
        "zipCode": "560001",
        "country": "India"
      },
      "gstNumber": "29ABCDE1234F1Z5",
      "paymentTerms": "credit_30",
      "status": "active",
      "createdAt": "2025-09-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 1,
    "count": 1,
    "totalRecords": 1
  }
}
```

#### 12. Get Supplier by ID
```http
GET /supplier/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { /* supplier object */ }
}
```

#### 13. Create Supplier (Manager/Admin Only)
```http
POST /supplier
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json

Body:
{
  "name": "New Supplier Ltd",
  "contactPerson": "Contact Person",
  "email": "contact@newsupplier.com",
  "phone": "9876543210",
  "address": {
    "street": "123 Business St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "gstNumber": "27ABCDE1234F1Z5",
  "paymentTerms": "cash",
  "notes": "Reliable supplier"
}

Response:
{
  "success": true,
  "message": "Supplier created successfully",
  "data": { /* created supplier */ }
}
```

#### 14. Update Supplier (Manager/Admin Only)
```http
PUT /supplier/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json

Body:
{
  "name": "Updated Supplier Name",
  "phone": "9876543211",
  "status": "active"
}

Response:
{
  "success": true,
  "message": "Supplier updated successfully",
  "data": { /* updated supplier */ }
}
```

#### 15. Delete Supplier (Manager/Admin Only)
```http
DELETE /supplier/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <manager_or_admin_token>

Response:
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

#### 16. Get Supplier Statistics
```http
GET /supplier/64f7b3b3b3b3b3b3b3b3b3b3/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "productCount": 15,
    "purchaseOrders": {
      "totalOrders": 25,
      "totalAmount": 500000,
      "pendingOrders": 3,
      "completedOrders": 22
    }
  }
}
```

---

### 📱 Product Management

#### 17. Get All Products
```http
GET /product?status=active&category=64f7b3b3b3b3b3b3b3b3b3b3&lowStock=true&search=laptop&page=1&limit=20
Authorization: Bearer <token>

Query Parameters:
- status: active|inactive|discontinued|all (default: active)
- category: category ID filter
- supplier: supplier ID filter
- lowStock: true|false (filter low stock products)
- search: search in name, SKU, barcode
- page: page number (default: 1)
- limit: items per page (default: 20)
- sortBy: name|sku|currentStock|costPrice|sellingPrice (default: name)
- sortOrder: asc|desc (default: asc)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Dell XPS 13 Laptop",
      "sku": "DELL-XPS13-001",
      "barcode": "1234567890123",
      "description": "High-performance ultrabook",
      "category": {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b4",
        "name": "Laptops"
      },
      "supplier": {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b5",
        "name": "Tech Solutions Pvt Ltd"
      },
      "unit": "piece",
      "costPrice": 75000,
      "sellingPrice": 85000,
      "currentStock": 15,
      "minStockLevel": 3,
      "maxStockLevel": 50,
      "reorderPoint": 5,
      "taxRate": 18,
      "status": "active",
      "profitMargin": 13.33,
      "isLowStock": false,
      "isOutOfStock": false,
      "createdAt": "2025-09-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 1,
    "count": 1,
    "totalRecords": 1
  }
}
```

#### 18. Get Product by ID
```http
GET /product/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Dell XPS 13 Laptop",
    "sku": "DELL-XPS13-001",
    "barcode": "1234567890123",
    "description": "High-performance ultrabook with Intel i7 processor",
    "category": {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Laptops",
      "description": "Laptop computers"
    },
    "supplier": {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b5",
      "name": "Tech Solutions Pvt Ltd",
      "contactPerson": "Rajesh Kumar",
      "phone": "9876543210",
      "email": "rajesh@techsolutions.com"
    },
    "unit": "piece",
    "costPrice": 75000,
    "sellingPrice": 85000,
    "currentStock": 15,
    "minStockLevel": 3,
    "maxStockLevel": 50,
    "reorderPoint": 5,
    "taxRate": 18,
    "images": ["https://example.com/laptop1.jpg"],
    "batch": {
      "batchNumber": "BATCH001",
      "manufacturingDate": "2025-08-01T00:00:00.000Z",
      "expiryDate": "2030-08-01T00:00:00.000Z"
    },
    "location": {
      "warehouse": "Main",
      "section": "Electronics",
      "shelf": "A1"
    },
    "status": "active",
    "tags": ["laptop", "intel", "ultrabook"],
    "profitMargin": 13.33,
    "isLowStock": false,
    "isOutOfStock": false,
    "createdAt": "2025-09-06T10:30:00.000Z"
  }
}
```

#### 19. Create Product (Manager/Admin Only)
```http
POST /product
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json

Body:
{
  "name": "iPhone 14 Pro",
  "sku": "APPLE-IP14PRO-256",
  "barcode": "1234567890124",
  "description": "Latest iPhone with 256GB storage",
  "category": "64f7b3b3b3b3b3b3b3b3b3b4",
  "supplier": "64f7b3b3b3b3b3b3b3b3b3b5",
  "unit": "piece",
  "costPrice": 80000,
  "sellingPrice": 95000,
  "currentStock": 10,
  "minStockLevel": 2,
  "maxStockLevel": 30,
  "reorderPoint": 3,
  "taxRate": 18,
  "images": ["https://example.com/iphone14.jpg"],
  "batch": {
    "batchNumber": "BATCH002",
    "manufacturingDate": "2025-08-15T00:00:00.000Z"
  },
  "location": {
    "warehouse": "Main",
    "section": "Mobile",
    "shelf": "B2"
  },
  "tags": ["smartphone", "apple", "ios"]
}

Response:
{
  "success": true,
  "message": "Product created successfully",
  "data": { /* created product with populated fields */ }
}
```

#### 20. Update Product (Manager/Admin Only)
```http
PUT /product/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json

Body:
{
  "name": "Updated Product Name",
  "sellingPrice": 90000,
  "minStockLevel": 5,
  "status": "active"
}

Response:
{
  "success": true,
  "message": "Product updated successfully",
  "data": { /* updated product */ }
}
```

#### 21. Update Product Stock (Staff+)
```http
PATCH /product/64f7b3b3b3b3b3b3b3b3b3b3/stock
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "type": "stock_in",           // stock_in or stock_out
  "quantity": 5,
  "unitPrice": 75000,          // Optional, defaults to product cost price
  "reference": "Manual adjustment",
  "notes": "Stock replenishment",
  "supplier": "64f7b3b3b3b3b3b3b3b3b3b5"  // Optional for stock_in
}

Response:
{
  "success": true,
  "message": "Stock added successfully",
  "data": {
    "product": "Dell XPS 13 Laptop",
    "previousStock": 15,
    "newStock": 20,
    "quantity": 5
  }
}
```

#### 22. Get Low Stock Products
```http
GET /product/low-stock
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Blue Gel Pen",
      "sku": "PEN-GEL-BLUE",
      "currentStock": 2,
      "minStockLevel": 20,
      "category": { "name": "Stationery" },
      "supplier": { "name": "Office Mart" }
    }
  ],
  "count": 1
}
```

#### 23. Get Product Stock History
```http
GET /product/64f7b3b3b3b3b3b3b3b3b3b3/stock-history?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b6",
      "product": "64f7b3b3b3b3b3b3b3b3b3b3",
      "transactionType": "stock_in",
      "quantity": 5,
      "unitPrice": 75000,
      "totalAmount": 375000,
      "previousStock": 15,
      "newStock": 20,
      "reference": "Manual adjustment",
      "notes": "Stock replenishment",
      "performedBy": {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b7",
        "name": "System Administrator"
      },
      "supplier": {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b5",
        "name": "Tech Solutions Pvt Ltd"
      },
      "createdAt": "2025-09-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 1,
    "count": 1,
    "totalRecords": 1
  }
}
```

#### 24. Delete Product (Manager/Admin Only)
```http
DELETE /product/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <manager_or_admin_token>

Response:
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 🛒 Purchase Order Management

#### 25. Get All Purchase Orders
```http
GET /purchaseOrder?status=pending&supplier=64f7b3b3b3b3b3b3b3b3b3b3&dateFrom=2025-09-01&dateTo=2025-09-30&page=1&limit=20
Authorization: Bearer <token>

Query Parameters:
- status: pending|confirmed|partial_received|received|cancelled|all
- supplier: supplier ID filter
- dateFrom: start date (YYYY-MM-DD)
- dateTo: end date (YYYY-MM-DD)
- page: page number (default: 1)
- limit: items per page (default: 20)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
      "orderNumber": "PO20250906001",
      "supplier": {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b4",
        "name": "Tech Solutions Pvt Ltd",
        "contactPerson": "Rajesh Kumar",
        "phone": "9876543210"
      },
      "items": [
        {
          "product": {
            "_id": "64f7b3b3b3b3b3b3b3b3b3b5",
            "name": "Dell XPS 13 Laptop",
            "sku": "DELL-XPS13-001"
          },
          "quantity": 10,
          "unitPrice": 75000,
          "totalPrice": 750000,
          "receivedQuantity": 0
        }
      ],
      "orderDate": "2025-09-06T10:30:00.000Z",
      "expectedDeliveryDate": "2025-09-15T00:00:00.000Z",
      "status": "pending",
      "subtotal": 750000,
      "taxAmount": 135000,
      "discountAmount": 0,
      "totalAmount": 885000,
      "paymentStatus": "pending",
      "paidAmount": 0,
      "remainingAmount": 885000,
      "createdBy": {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b6",
        "name": "System Administrator"
      },
      "createdAt": "2025-09-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 1,
    "count": 1,
    "totalRecords": 1
  }
}
```

#### 26. Get Purchase Order by ID
```http
GET /purchaseOrder/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
    "orderNumber": "PO20250906001",
    "supplier": { /* full supplier object */ },
    "items": [
      {
        "product": { /* full product object */ },
        "quantity": 10,
        "unitPrice": 75000,
        "totalPrice": 750000,
        "receivedQuantity": 0
      }
    ],
    "orderDate": "2025-09-06T10:30:00.000Z",
    "expectedDeliveryDate": "2025-09-15T00:00:00.000Z",
    "actualDeliveryDate": null,
    "status": "pending",
    "subtotal": 750000,
    "taxAmount": 135000,
    "discountAmount": 0,
    "totalAmount": 885000,
    "paymentStatus": "pending",
    "paidAmount": 0,
    "remainingAmount": 885000,
    "notes": "Urgent order for new stock",
    "createdBy": { /* user object */ },
    "receivedBy": null,
    "isFullyReceived": false,
    "createdAt": "2025-09-06T10:30:00.000Z"
  }
}
```

#### 27. Create Purchase Order (Manager/Admin Only)
```http
POST /purchaseOrder
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json

Body:
{
  "supplier": "64f7b3b3b3b3b3b3b3b3b3b3",
  "items": [
    {
      "product": "64f7b3b3b3b3b3b3b3b3b3b4",
      "quantity": 10,
      "unitPrice": 75000
    },
    {
      "product": "64f7b3b3b3b3b3b3b3b3b3b5",
      "quantity": 5,
      "unitPrice": 65000
    }
  ],
  "expectedDeliveryDate": "2025-09-15T00:00:00.000Z",
  "discountAmount": 10000,
  "taxAmount": 135000,
  "notes": "Monthly stock replenishment"
}

Response:
{
  "success": true,
  "message": "Purchase order created successfully",
  "data": { /* created purchase order */ }
}
```

#### 28. Update Purchase Order (Manager/Admin Only)
```http
PUT /purchaseOrder/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json

Body:
{
  "expectedDeliveryDate": "2025-09-20T00:00:00.000Z",
  "discountAmount": 15000,
  "status": "confirmed",
  "notes": "Updated delivery date"
}

Response:
{
  "success": true,
  "message": "Purchase order updated successfully",
  "data": { /* updated purchase order */ }
}
```

#### 29. Receive Goods (Staff+)
```http
PATCH /purchaseOrder/64f7b3b3b3b3b3b3b3b3b3b3/receive
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "receivedItems": [
    {
      "productId": "64f7b3b3b3b3b3b3b3b3b3b4",
      "receivedQuantity": 8  // Partial delivery - ordered 10, received 8
    },
    {
      "productId": "64f7b3b3b3b3b3b3b3b3b3b5",
      "receivedQuantity": 5  // Full delivery
    }
  ]
}

Response:
{
  "success": true,
  "message": "Goods received successfully",
  "data": { /* updated purchase order with received quantities */ }
}
```

#### 30. Cancel Purchase Order (Manager/Admin Only)
```http
PATCH /purchaseOrder/64f7b3b3b3b3b3b3b3b3b3b3/cancel
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json

Body:
{
  "reason": "Supplier unable to deliver on time"
}

Response:
{
  "success": true,
  "message": "Purchase order cancelled successfully",
  "data": { /* cancelled purchase order */ }
}
```

#### 31. Delete Purchase Order (Manager/Admin Only)
```http
DELETE /purchaseOrder/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <manager_or_admin_token>

Response:
{
  "success": true,
  "message": "Purchase order deleted successfully"
}
```

---

### 💰 Sales & Invoice Management

#### 32. Get All Sales
```http
GET /sales?status=confirmed&paymentStatus=pending&dateFrom=2025-09-01&dateTo=2025-09-30&customer=john&page=1&limit=20
Authorization: Bearer <token>

Query Parameters:
- status: draft|confirmed|cancelled|returned|all
- paymentStatus: pending|partial|paid|overdue|all
- dateFrom: start date (YYYY-MM-DD)
- dateTo: end date (YYYY-MM-DD)
- customer: search in customer name
- page: page number (default: 1)
- limit: items per page (default: 20)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
      "invoiceNumber": "INV20250906001",
      "customer": {
        "name": "John Doe",
        "phone": "9876543210",
        "email": "john@example.com",
        "address": "123 Main St, City"
      },
      "items": [
        {
          "product": {
            "_id": "64f7b3b3b3b3b3b3b3b3b3b4",
            "name": "Blue Gel Pen",
            "sku": "PEN-GEL-BLUE"
          },
          "quantity": 10,
          "unitPrice": 25,
          "discount": 0,
          "taxRate": 12,
          "taxAmount": 30,
          "totalPrice": 280
        }
      ],
      "saleDate": "2025-09-06T10:30:00.000Z",
      "dueDate": null,
      "subtotal": 250,
      "totalDiscount": 0,
      "totalTax": 30,
      "grandTotal": 280,
      "paymentMethod": "cash",
      "paymentStatus": "paid",
      "paidAmount": 280,
      "remainingAmount": 0,
      "status": "confirmed",
      "soldBy": {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b5",
        "name": "Store Staff"
      },
      "createdAt": "2025-09-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 1,
    "count": 1,
    "totalRecords": 1
  }
}
```

#### 33. Get Sales Statistics
```http
GET /sales/stats?period=today
Authorization: Bearer <token>

Query Parameters:
- period: today|week|month|year (default: today)

Response:
{
  "success": true,
  "data": {
    "totalSales": 15,
    "totalRevenue": 125000,
    "totalPaid": 100000,
    "pendingAmount": 25000
  }
}
```

#### 34. Get Sale by ID
```http
GET /sales/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
    "invoiceNumber": "INV20250906001",
    "customer": {
      "name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com",
      "address": "123 Main St, City",
      "gstNumber": "29ABCDE1234F1Z5"
    },
    "items": [
      {
        "product": {
          "_id": "64f7b3b3b3b3b3b3b3b3b3b4",
          "name": "Dell XPS 13 Laptop",
          "sku": "DELL-XPS13-001",
          "unit": "piece"
        },
        "quantity": 1,
        "unitPrice": 85000,
        "discount": 5000,
        "taxRate": 18,
        "taxAmount": 14400,
        "totalPrice": 94400
      }
    ],
    "saleDate": "2025-09-06T10:30:00.000Z",
    "dueDate": "2025-09-15T00:00:00.000Z",
    "subtotal": 85000,
    "totalDiscount": 5000,
    "totalTax": 14400,
    "grandTotal": 94400,
    "paymentMethod": "card",
    "paymentStatus": "partial",
    "paidAmount": 50000,
    "remainingAmount": 44400,
    "status": "confirmed",
    "notes": "Customer preferred EMI payment",
    "soldBy": {
      "_id": "64f7b3b3b3b3b3b3b3b3b3b5",
      "name": "Store Staff"
    },
    "createdAt": "2025-09-06T10:30:00.000Z"
  }
}
```

#### 35. Create Sale (Staff+)
```http
POST /sales
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "customer": {
    "name": "Jane Smith",
    "phone": "9876543211",
    "email": "jane@example.com",
    "address": "456 Business St, City",
    "gstNumber": "29ABCDE1234F1Z6"
  },
  "items": [
    {
      "product": "64f7b3b3b3b3b3b3b3b3b3b4",
      "quantity": 1,
      "unitPrice": 85000,        // Optional - defaults to product selling price
      "discount": 2000,          // Optional
      "taxRate": 18              // Optional - defaults to product tax rate
    },
    {
      "product": "64f7b3b3b3b3b3b3b3b3b3b5",
      "quantity": 2,
      "unitPrice": 25,
      "discount": 0,
      "taxRate": 12
    }
  ],
  "paymentMethod": "cash",       // cash|card|upi|bank_transfer|credit
  "paidAmount": 85050,           // Optional - defaults to 0
  "dueDate": "2025-09-15T00:00:00.000Z",  // Optional for credit sales
  "notes": "Walk-in customer sale"
}

Response:
{
  "success": true,
  "message": "Sale created successfully",
  "data": { /* created sale with auto-generated invoice number */ }
}
```

#### 36. Record Payment (Staff+)
```http
PATCH /sales/64f7b3b3b3b3b3b3b3b3b3b3/payment
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amount": 25000,
  "paymentMethod": "card",       // Optional
  "notes": "Partial payment received"  // Optional
}

Response:
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "invoiceNumber": "INV20250906001",
    "paidAmount": 75000,
    "remainingAmount": 19400,
    "paymentStatus": "partial"
  }
}
```

#### 37. Update Sale (Manager/Admin Only)
```http
PUT /sales/64f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json

Body:
{
  "customer": {
    "name": "Updated Customer Name",
    "phone": "9876543212"
  },
  "paymentMethod": "bank_transfer",
  "dueDate": "2025-09-20T00:00:00.000Z",
  "status": "confirmed",
  "notes": "Updated customer information"
}

Response:
{
  "success": true,
  "message": "Sale updated successfully",
  "data": { /* updated sale */ }
}
```

#### 38. Cancel Sale (Manager/Admin Only)
```http
PATCH /sales/64f7b3b3b3b3b3b3b3b3b3b3/cancel
Authorization: Bearer <manager_or_admin_token>
Content-Type: application/json

Body:
{
  "reason": "Customer requested cancellation"
}

Response:
{
  "success": true,
  "message": "Sale cancelled successfully",
  "data": { /* cancelled sale with stock restored */ }
}
```

---

### 📊 Dashboard & Reports

#### 39. Get Dashboard Overview
```http
GET /dashboard/overview
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "stockSummary": {
      "totalValue": 2500000,
      "totalProducts": 25,
      "totalStock": 450,
      "lowStockCount": 3,
      "outOfStockCount": 1
    },
    "todaySales": {
      "totalSales": 8,
      "totalRevenue": 125000,
      "totalPaid": 100000,
      "pendingAmount": 25000
    },
    "pendingPurchaseOrders": 5,
    "recentTransactions": [
      {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
        "product": {
          "_id": "64f7b3b3b3b3b3b3b3b3b3b4",
          "name": "Dell XPS 13 Laptop",
          "sku": "DELL-XPS13-001"
        },
        "transactionType": "sale",
        "quantity": 1,
        "newStock": 14,
        "performedBy": {
          "_id": "64f7b3b3b3b3b3b3b3b3b3b5",
          "name": "Store Staff"
        },
        "createdAt": "2025-09-06T10:30:00.000Z"
      }
    ],
    "topSellingProducts": [
      {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b4",
        "productName": "Blue Gel Pen",
        "sku": "PEN-GEL-BLUE",
        "totalQuantity": 50,
        "totalRevenue": 1250
      }
    ]
  }
}
```

#### 40. Get Inventory Report
```http
GET /dashboard/inventory-report?category=64f7b3b3b3b3b3b3b3b3b3b3&supplier=64f7b3b3b3b3b3b3b3b3b3b4&status=active
Authorization: Bearer <token>

Query Parameters:
- category: category ID filter
- supplier: supplier ID filter  
- status: active|inactive|discontinued|all

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 25,
      "totalStockValue": 2500000,
      "inStock": 20,
      "lowStock": 3,
      "outOfStock": 2
    },
    "products": [
      {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Dell XPS 13 Laptop",
        "sku": "DELL-XPS13-001",
        "category": "Laptops",
        "supplier": "Tech Solutions Pvt Ltd",
        "currentStock": 15,
        "minStockLevel": 3,
        "costPrice": 75000,
        "sellingPrice": 85000,
        "stockValue": 1125000,
        "profitMargin": 13.33,
        "stockStatus": "In Stock"
      }
    ]
  }
}
```

#### 41. Get Sales Report
```http
GET /dashboard/sales-report?dateFrom=2025-09-01&dateTo=2025-09-30&period=daily&product=64f7b3b3b3b3b3b3b3b3b3b3&customer=john
Authorization: Bearer <token>

Query Parameters:
- dateFrom: start date (YYYY-MM-DD)
- dateTo: end date (YYYY-MM-DD)
- period: daily|monthly|yearly (default: daily)
- product: product ID for product-specific report
- customer: customer name filter

Response:
{
  "success": true,
  "data": {
    "salesReport": [
      {
        "_id": {
          "year": 2025,
          "month": 9,
          "day": 6
        },
        "totalSales": 8,
        "totalRevenue": 125000,
        "totalPaid": 100000,
        "totalDiscount": 5000,
        "totalTax": 18000
      }
    ],
    "productSales": [
      {
        "_id": {
          "year": 2025,
          "month": 9,
          "day": 6
        },
        "totalQuantity": 3,
        "totalRevenue": 255000
      }
    ]
  }
}
```

#### 42. Get Purchase Report
```http
GET /dashboard/purchase-report?dateFrom=2025-09-01&dateTo=2025-09-30&supplier=64f7b3b3b3b3b3b3b3b3b3b3&status=received
Authorization: Bearer <token>

Query Parameters:
- dateFrom: start date (YYYY-MM-DD)
- dateTo: end date (YYYY-MM-DD)
- supplier: supplier ID filter
- status: pending|confirmed|partial_received|received|cancelled|all

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalOrders": 15,
      "totalAmount": 1500000,
      "totalPaid": 1200000,
      "pendingOrders": 3,
      "completedOrders": 12
    },
    "orders": [
      {
        "_id": "64f7b3b3b3b3b3b3b3b3b3b3",
        "orderNumber": "PO20250906001",
        "supplierName": "Tech Solutions Pvt Ltd",
        "orderDate": "2025-09-06T10:30:00.000Z",
        "expectedDeliveryDate": "2025-09-15T00:00:00.000Z",
        "actualDeliveryDate": "2025-09-14T00:00:00.000Z",
        "status": "received",
        "totalAmount": 885000,
        "paidAmount": 885000,
        "remainingAmount": 0,
        "itemCount": 2
      }
    ]
  }
}
```

#### 43. Get Profit & Loss Report
```http
GET /dashboard/profit-loss-report?dateFrom=2025-09-01&dateTo=2025-09-30
Authorization: Bearer <token>

Query Parameters:
- dateFrom: start date (YYYY-MM-DD), defaults to current month start
- dateTo: end date (YYYY-MM-DD), defaults to current month end

Response:
{
  "success": true,
  "data": {
    "revenue": {
      "grossRevenue": 500000,
      "taxes": 75000,
      "discounts": 25000,
      "netRevenue": 400000
    },
    "expenses": {
      "costOfGoodsSold": 300000,
      "totalExpenses": 300000
    },
    "profit": {
      "grossProfit": 200000,
      "netProfit": 100000,
      "profitMargin": 20.0
    }
  }
}
```

---

## 🔧 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created successfully  
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Authentication Errors
```json
{
  "success": false,
  "message": "Access denied. No valid token provided."
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Please enter a valid email",
    "password": "Password must be at least 6 characters"
  }
}
```

---

## 📱 Frontend Development Guide

### 1. Authentication Flow
```javascript
// Login
const loginResponse = await fetch('/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token, user } = await loginResponse.json();
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Use token for subsequent requests
const authHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

### 2. Role-Based UI Components
```javascript
const user = JSON.parse(localStorage.getItem('user'));

// Show/hide based on role
const isAdmin = user.role === 'admin';
const isManagerOrAbove = ['manager', 'admin'].includes(user.role);
const isStaffOrAbove = ['staff', 'manager', 'admin'].includes(user.role);

// Example: Only show delete button for admin
{isAdmin && <DeleteButton />}

// Example: Show create product for manager+
{isManagerOrAbove && <CreateProductButton />}
```

### 3. Pagination Helper
```javascript
const fetchProducts = async (page = 1, limit = 20, filters = {}) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  
  const response = await fetch(`/product?${queryParams}`, {
    headers: authHeaders
  });
  
  return response.json();
};
```

### 4. Real-time Updates
Consider implementing WebSocket connections for:
- Low stock alerts
- New sales notifications  
- Stock level changes
- Purchase order updates

### 5. Recommended Frontend Structure
```
src/
├── components/
│   ├── auth/          # Login, Register components
│   ├── dashboard/     # Dashboard widgets
│   ├── products/      # Product management
│   ├── suppliers/     # Supplier management
│   ├── sales/         # Sales/Invoice components
│   ├── purchases/     # Purchase order components
│   └── reports/       # Report components
├── services/
│   ├── api.js         # API service functions
│   ├── auth.js        # Authentication utilities
│   └── utils.js       # Helper functions
├── hooks/             # Custom React hooks
├── contexts/          # React contexts (AuthContext, etc.)
└── utils/             # Utility functions
```

---

## 🎯 Test Users & Sample Data

### Available Test Users
```
Admin User:
- Email: admin@stockms.com
- Password: admin123
- Role: admin (full access)

Manager User:
- Email: manager@stockms.com  
- Password: manager123
- Role: manager (can manage suppliers, purchase orders)

Staff User:
- Email: staff@stockms.com
- Password: staff123
- Role: staff (can manage sales, update stock)
```

### Sample Data Available
- **4 Categories**: Electronics, Laptops, Mobile Phones, Stationery
- **2 Suppliers**: Tech Solutions Pvt Ltd, Office Mart
- **5 Products**: Dell XPS 13, iPhone 13, Galaxy S21, A4 Paper, Gel Pen

This comprehensive API documentation should provide everything you need to start frontend development. Each endpoint includes request/response examples, authentication requirements, and role-based access information.
