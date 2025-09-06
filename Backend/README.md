# Stock Management System - Backend

A comprehensive stock management system backend built for small stores, featuring inventory management, supplier management, purchase orders, sales tracking, and detailed reporting.

## Features

### 🔐 User & Role Management
- **Staff**: Basic stock operations, sales creation
- **Manager**: Supplier management, purchase orders, advanced operations  
- **Admin**: Full system access, user management, configuration

### 📦 Product & Inventory Management
- Complete product catalog with categories and subcategories
- Real-time stock tracking with automatic updates
- Low stock alerts and out-of-stock monitoring
- Batch tracking and expiry date management (optional)
- Multi-location warehouse support
- SKU and barcode management

### 🏪 Supplier Management
- Comprehensive supplier database
- Contact information and payment terms
- GST number and address management
- Supplier performance tracking

### 🛒 Purchase Order Management
- Auto-generated purchase order numbers
- Partial goods receiving capability
- Automatic stock updates on receipt
- Purchase order status tracking
- Supplier relationship management

### 💰 Sales & Invoicing
- Auto-generated invoice numbers
- Customer information management
- Tax and discount calculations
- Multiple payment methods support
- Payment tracking and due date management

### 📊 Reporting & Analytics
- Dashboard with key performance metrics
- Inventory reports with stock status
- Sales reports with period filtering
- Purchase reports and supplier analytics
- Profit & Loss statements
- Low stock and reorder alerts

### 🔄 Stock Control
- Stock in/out transactions
- Manual stock adjustments
- Complete transaction history
- Audit trail with user accountability
- Automatic stock level calculations

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5050
   MONGODB_URI=mongodb://localhost:27017/stock_management
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Create sample data (optional)**
   ```bash
   npm run create-sample-data
   ```

### Test Users (created with sample data)
- **Admin**: `admin@stockms.com` / `admin123`
- **Manager**: `manager@stockms.com` / `manager123`
- **Staff**: `staff@stockms.com` / `staff123`

## API Documentation

The API documentation is available in `/docs/STOCK_API.md` with complete endpoint details, request/response examples, and authentication requirements.

### Base URL
```
http://localhost:5050
```

### Key Endpoints
- **Authentication**: `/user/login`, `/user/register`
- **Products**: `/product` (CRUD operations, stock management)
- **Categories**: `/category` (hierarchical categories)
- **Suppliers**: `/supplier` (supplier management)
- **Purchase Orders**: `/purchaseOrder` (PO lifecycle)
- **Sales**: `/sales` (invoice generation, payment tracking)
- **Dashboard**: `/dashboard` (analytics and reports)

## Project Structure

```
Backend/
├── controllers/          # Business logic
│   ├── category.controller.js
│   ├── dashboard.controller.js
│   ├── product.controller.js
│   ├── purchaseOrder.controller.js
│   ├── sales.controller.js
│   ├── supplier.controller.js
│   └── user.controller.js
├── models/              # Database schemas
│   ├── category.model.js
│   ├── product.model.js
│   ├── purchaseOrder.model.js
│   ├── sales.model.js
│   ├── stockTransaction.model.js
│   ├── supplier.model.js
│   └── user.model.js
├── routes/              # API routes
│   ├── category.router.js
│   ├── dashboard.router.js
│   ├── product.router.js
│   ├── purchaseOrder.router.js
│   ├── sales.router.js
│   ├── supplier.router.js
│   └── user.router.js
├── middlewares/         # Authentication & authorization
│   ├── auth.js
│   ├── isAdmin.js
│   ├── staff.js
│   └── validation.js
├── lib/                 # Database connection
├── docs/                # Documentation
└── testSampleData.js    # Sample data creation
```

## Database Models

### Core Entities
- **Product**: Inventory items with pricing, stock levels, and metadata
- **Category**: Hierarchical product categorization
- **Supplier**: Vendor information and relationship management
- **Purchase Order**: Procurement workflow management
- **Sales**: Customer transactions and invoicing
- **Stock Transaction**: Complete audit trail of stock movements
- **User**: Authentication and role-based access control

### Key Relationships
- Products belong to Categories and Suppliers
- Purchase Orders contain multiple Products from one Supplier
- Sales contain multiple Products sold to Customers
- Stock Transactions track all inventory movements
- Users have role-based permissions (Staff/Manager/Admin)

## Security Features
- JWT-based authentication
- Role-based authorization
- Password hashing with bcrypt
- Input validation and sanitization
- Error handling and logging

## Performance Features
- Database indexing for fast queries
- Pagination for large data sets
- Efficient aggregation for reports
- Optimized queries with population

## Future Enhancements
- [ ] Barcode scanner integration
- [ ] Report export (CSV/Excel/PDF)
- [ ] Email notifications
- [ ] Cloud backup functionality
- [ ] Multi-store support
- [ ] Advanced analytics and forecasting
- [ ] Mobile app integration
- [ ] Accounting software integration

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project follows standard JavaScript conventions with:
- Consistent naming conventions
- Proper error handling
- Comprehensive input validation
- Clear documentation

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
MIT License - see LICENSE file for details

## Support
For questions or support, please contact the development team or create an issue in the repository.

---

Built with ❤️ for Code-A-Thon - Stock Management System for Small Stores
