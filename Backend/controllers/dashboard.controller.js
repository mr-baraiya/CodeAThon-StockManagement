const Product = require("../models/product.model");
const Sales = require("../models/sales.model");
const PurchaseOrder = require("../models/purchaseOrder.model");
const StockTransaction = require("../models/stockTransaction.model");
const Category = require("../models/category.model");
const Supplier = require("../models/supplier.model");
const mongoose = require("mongoose");

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        // Get total stock value
        const stockValue = await Product.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ["$currentStock", "$costPrice"] } },
                    totalProducts: { $sum: 1 },
                    totalStock: { $sum: "$currentStock" }
                } 
            }
        ]);
        
        // Get low stock count
        const lowStockCount = await Product.countDocuments({
            status: 'active',
            $expr: { $lte: ["$currentStock", "$minStockLevel"] }
        });
        
        // Get out of stock count
        const outOfStockCount = await Product.countDocuments({
            status: 'active',
            currentStock: 0
        });
        
        // Get today's sales
        const todaySales = await Sales.aggregate([
            {
                $match: {
                    saleDate: { $gte: startOfDay, $lt: endOfDay },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$grandTotal" },
                    totalPaid: { $sum: "$paidAmount" }
                }
            }
        ]);
        
        // Get pending purchase orders
        const pendingPurchaseOrders = await PurchaseOrder.countDocuments({
            status: { $in: ['pending', 'confirmed'] }
        });
        
        // Get recent stock transactions
        const recentTransactions = await StockTransaction.find()
            .populate('product', 'name sku')
            .populate('performedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(10);
        
        // Get top selling products (last 30 days)
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const topSellingProducts = await Sales.aggregate([
            {
                $match: {
                    saleDate: { $gte: thirtyDaysAgo },
                    status: { $ne: 'cancelled' }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.totalPrice" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: "$product" },
            {
                $project: {
                    productName: "$product.name",
                    sku: "$product.sku",
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            }
        ]);
        
        const overview = {
            stockSummary: {
                totalValue: stockValue[0]?.totalValue || 0,
                totalProducts: stockValue[0]?.totalProducts || 0,
                totalStock: stockValue[0]?.totalStock || 0,
                lowStockCount,
                outOfStockCount
            },
            todaySales: {
                totalSales: todaySales[0]?.totalSales || 0,
                totalRevenue: todaySales[0]?.totalRevenue || 0,
                totalPaid: todaySales[0]?.totalPaid || 0,
                pendingAmount: (todaySales[0]?.totalRevenue || 0) - (todaySales[0]?.totalPaid || 0)
            },
            pendingPurchaseOrders,
            recentTransactions,
            topSellingProducts
        };
        
        res.status(200).json({
            success: true,
            data: overview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard overview",
            error: error.message
        });
    }
};

// Get inventory report
exports.getInventoryReport = async (req, res) => {
    try {
        const { category, supplier, status = 'active' } = req.query;
        
        let matchQuery = {};
        if (status !== 'all') {
            matchQuery.status = status;
        }
        if (category) {
            matchQuery.category = mongoose.Types.ObjectId(category);
        }
        if (supplier) {
            matchQuery.supplier = mongoose.Types.ObjectId(supplier);
        }
        
        const report = await Product.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $lookup: {
                    from: 'suppliers',
                    localField: 'supplier',
                    foreignField: '_id',
                    as: 'supplierInfo'
                }
            },
            { $unwind: "$categoryInfo" },
            { $unwind: "$supplierInfo" },
            {
                $project: {
                    name: 1,
                    sku: 1,
                    category: "$categoryInfo.name",
                    supplier: "$supplierInfo.name",
                    currentStock: 1,
                    minStockLevel: 1,
                    costPrice: 1,
                    sellingPrice: 1,
                    stockValue: { $multiply: ["$currentStock", "$costPrice"] },
                    profitMargin: {
                        $multiply: [
                            { $divide: [{ $subtract: ["$sellingPrice", "$costPrice"] }, "$costPrice"] },
                            100
                        ]
                    },
                    stockStatus: {
                        $cond: {
                            if: { $eq: ["$currentStock", 0] },
                            then: "Out of Stock",
                            else: {
                                $cond: {
                                    if: { $lte: ["$currentStock", "$minStockLevel"] },
                                    then: "Low Stock",
                                    else: "In Stock"
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { name: 1 } }
        ]);
        
        // Calculate summary
        const summary = {
            totalProducts: report.length,
            totalStockValue: report.reduce((sum, item) => sum + item.stockValue, 0),
            inStock: report.filter(item => item.stockStatus === "In Stock").length,
            lowStock: report.filter(item => item.stockStatus === "Low Stock").length,
            outOfStock: report.filter(item => item.stockStatus === "Out of Stock").length
        };
        
        res.status(200).json({
            success: true,
            data: {
                summary,
                products: report
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating inventory report",
            error: error.message
        });
    }
};

// Get sales report
exports.getSalesReport = async (req, res) => {
    try {
        const {
            dateFrom,
            dateTo,
            period = 'daily',
            product,
            customer
        } = req.query;
        
        let dateFilter = {};
        if (dateFrom || dateTo) {
            if (dateFrom) dateFilter.$gte = new Date(dateFrom);
            if (dateTo) dateFilter.$lte = new Date(dateTo);
        } else {
            // Default to last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateFilter.$gte = thirtyDaysAgo;
        }
        
        let matchQuery = {
            saleDate: dateFilter,
            status: { $ne: 'cancelled' }
        };
        
        if (customer) {
            matchQuery['customer.name'] = { $regex: customer, $options: 'i' };
        }
        
        // Group by period
        let groupBy;
        switch (period) {
            case 'daily':
                groupBy = {
                    year: { $year: "$saleDate" },
                    month: { $month: "$saleDate" },
                    day: { $dayOfMonth: "$saleDate" }
                };
                break;
            case 'monthly':
                groupBy = {
                    year: { $year: "$saleDate" },
                    month: { $month: "$saleDate" }
                };
                break;
            case 'yearly':
                groupBy = {
                    year: { $year: "$saleDate" }
                };
                break;
            default:
                groupBy = {
                    year: { $year: "$saleDate" },
                    month: { $month: "$saleDate" },
                    day: { $dayOfMonth: "$saleDate" }
                };
        }
        
        const salesReport = await Sales.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: groupBy,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$grandTotal" },
                    totalPaid: { $sum: "$paidAmount" },
                    totalDiscount: { $sum: "$totalDiscount" },
                    totalTax: { $sum: "$totalTax" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);
        
        // Get product-wise sales if specific product is requested
        let productSales = [];
        if (product) {
            productSales = await Sales.aggregate([
                { $match: matchQuery },
                { $unwind: "$items" },
                {
                    $match: {
                        "items.product": mongoose.Types.ObjectId(product)
                    }
                },
                {
                    $group: {
                        _id: groupBy,
                        totalQuantity: { $sum: "$items.quantity" },
                        totalRevenue: { $sum: "$items.totalPrice" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]);
        }
        
        res.status(200).json({
            success: true,
            data: {
                salesReport,
                productSales
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating sales report",
            error: error.message
        });
    }
};

// Get purchase report
exports.getPurchaseReport = async (req, res) => {
    try {
        const {
            dateFrom,
            dateTo,
            supplier,
            status
        } = req.query;
        
        let matchQuery = {};
        
        if (dateFrom || dateTo) {
            matchQuery.orderDate = {};
            if (dateFrom) matchQuery.orderDate.$gte = new Date(dateFrom);
            if (dateTo) matchQuery.orderDate.$lte = new Date(dateTo);
        }
        
        if (supplier) {
            matchQuery.supplier = mongoose.Types.ObjectId(supplier);
        }
        
        if (status && status !== 'all') {
            matchQuery.status = status;
        }
        
        const purchaseReport = await PurchaseOrder.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'suppliers',
                    localField: 'supplier',
                    foreignField: '_id',
                    as: 'supplierInfo'
                }
            },
            { $unwind: "$supplierInfo" },
            {
                $project: {
                    orderNumber: 1,
                    supplierName: "$supplierInfo.name",
                    orderDate: 1,
                    expectedDeliveryDate: 1,
                    actualDeliveryDate: 1,
                    status: 1,
                    totalAmount: 1,
                    paidAmount: 1,
                    remainingAmount: { $subtract: ["$totalAmount", "$paidAmount"] },
                    itemCount: { $size: "$items" }
                }
            },
            { $sort: { orderDate: -1 } }
        ]);
        
        // Calculate summary
        const summary = await PurchaseOrder.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" },
                    totalPaid: { $sum: "$paidAmount" },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                    },
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "received"] }, 1, 0] }
                    }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                summary: summary[0] || {
                    totalOrders: 0,
                    totalAmount: 0,
                    totalPaid: 0,
                    pendingOrders: 0,
                    completedOrders: 0
                },
                orders: purchaseReport
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating purchase report",
            error: error.message
        });
    }
};

// Get profit & loss report
exports.getProfitLossReport = async (req, res) => {
    try {
        const {
            dateFrom,
            dateTo
        } = req.query;
        
        let dateFilter = {};
        if (dateFrom || dateTo) {
            if (dateFrom) dateFilter.$gte = new Date(dateFrom);
            if (dateTo) dateFilter.$lte = new Date(dateTo);
        } else {
            // Default to current month
            const now = new Date();
            dateFilter = {
                $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
            };
        }
        
        // Get sales data
        const salesData = await Sales.aggregate([
            {
                $match: {
                    saleDate: dateFilter,
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$grandTotal" },
                    totalTax: { $sum: "$totalTax" },
                    totalDiscount: { $sum: "$totalDiscount" }
                }
            }
        ]);
        
        // Get purchase data
        const purchaseData = await PurchaseOrder.aggregate([
            {
                $match: {
                    orderDate: dateFilter,
                    status: { $in: ['received', 'partial_received'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPurchases: { $sum: "$totalAmount" }
                }
            }
        ]);
        
        // Calculate basic P&L (simplified version)
        const revenue = salesData[0]?.totalRevenue || 0;
        const taxes = salesData[0]?.totalTax || 0;
        const discounts = salesData[0]?.totalDiscount || 0;
        const purchases = purchaseData[0]?.totalPurchases || 0;
        
        const grossProfit = revenue - purchases;
        const netRevenue = revenue - taxes - discounts;
        const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
        
        const report = {
            revenue: {
                grossRevenue: revenue,
                taxes,
                discounts,
                netRevenue
            },
            expenses: {
                costOfGoodsSold: purchases,
                // Add other expenses like rent, salary, etc. as needed
                totalExpenses: purchases
            },
            profit: {
                grossProfit,
                netProfit: grossProfit, // Simplified - should subtract operational expenses
                profitMargin
            }
        };
        
        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating profit & loss report",
            error: error.message
        });
    }
};
