const Sales = require("../models/sales.model");
const Product = require("../models/product.model");
const StockTransaction = require("../models/stockTransaction.model");

// Get all sales
exports.getAllSales = async (req, res) => {
    try {
        const {
            status,
            paymentStatus,
            dateFrom,
            dateTo,
            customer,
            page = 1,
            limit = 20
        } = req.query;
        
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (paymentStatus && paymentStatus !== 'all') {
            query.paymentStatus = paymentStatus;
        }
        
        if (customer) {
            query['customer.name'] = { $regex: customer, $options: 'i' };
        }
        
        if (dateFrom || dateTo) {
            query.saleDate = {};
            if (dateFrom) query.saleDate.$gte = new Date(dateFrom);
            if (dateTo) query.saleDate.$lte = new Date(dateTo);
        }
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const sales = await Sales.find(query)
            .populate('items.product', 'name sku')
            .populate('soldBy', 'name')
            .sort({ saleDate: -1 })
            .skip(skip)
            .limit(limitNum);
        
        const total = await Sales.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: sales,
            pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                count: sales.length,
                totalRecords: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching sales",
            error: error.message
        });
    }
};

// Get single sale by ID
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sales.findById(req.params.id)
            .populate('items.product', 'name sku unit')
            .populate('soldBy', 'name');
        
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: sale
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching sale",
            error: error.message
        });
    }
};

// Create new sale/invoice
exports.createSale = async (req, res) => {
    try {
        const {
            customer,
            items,
            paymentMethod = 'cash',
            paidAmount = 0,
            dueDate,
            notes
        } = req.body;
        
        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Sale must have at least one item"
            });
        }
        
        // Check stock availability and calculate totals
        const processedItems = [];
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.product} not found`
                });
            }
            
            if (product.currentStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${item.quantity}`
                });
            }
            
            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                unitPrice: item.unitPrice || product.sellingPrice,
                discount: item.discount || 0,
                taxRate: item.taxRate || product.taxRate || 0
            });
        }
        
        // Generate invoice number
        const invoiceNumber = await Sales.generateInvoiceNumber();
        
        const sale = new Sales({
            invoiceNumber,
            customer,
            items: processedItems,
            paymentMethod,
            paidAmount,
            dueDate,
            notes,
            soldBy: req.user.id
        });
        
        await sale.save();
        
        // Update product stocks and create transactions
        for (let i = 0; i < processedItems.length; i++) {
            const item = processedItems[i];
            const product = await Product.findById(item.product);
            
            const previousStock = product.currentStock;
            product.currentStock -= item.quantity;
            await product.save();
            
            // Create stock transaction
            await StockTransaction.create({
                product: product._id,
                transactionType: 'sale',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                previousStock,
                newStock: product.currentStock,
                reference: sale.invoiceNumber,
                customer: {
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email
                },
                notes: `Sale transaction for invoice ${sale.invoiceNumber}`,
                performedBy: req.user.id
            });
        }
        
        await sale.populate('items.product', 'name sku');
        await sale.populate('soldBy', 'name');
        
        res.status(201).json({
            success: true,
            message: "Sale created successfully",
            data: sale
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating sale",
            error: error.message
        });
    }
};

// Update sale
exports.updateSale = async (req, res) => {
    try {
        const {
            customer,
            paymentMethod,
            dueDate,
            status,
            notes
        } = req.body;
        
        const sale = await Sales.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            });
        }
        
        // Check if sale can be modified
        if (sale.status === 'cancelled' || sale.status === 'returned') {
            return res.status(400).json({
                success: false,
                message: "Cannot modify cancelled or returned sales"
            });
        }
        
        // Update fields (items cannot be updated to prevent stock issues)
        if (customer) sale.customer = { ...sale.customer, ...customer };
        if (paymentMethod) sale.paymentMethod = paymentMethod;
        if (dueDate !== undefined) sale.dueDate = dueDate;
        if (status) sale.status = status;
        if (notes !== undefined) sale.notes = notes;
        
        await sale.save();
        
        res.status(200).json({
            success: true,
            message: "Sale updated successfully",
            data: sale
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating sale",
            error: error.message
        });
    }
};

// Record payment
exports.recordPayment = async (req, res) => {
    try {
        const { amount, paymentMethod, notes } = req.body;
        
        const sale = await Sales.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            });
        }
        
        if (sale.status === 'cancelled' || sale.status === 'returned') {
            return res.status(400).json({
                success: false,
                message: "Cannot record payment for cancelled or returned sales"
            });
        }
        
        const newPaidAmount = sale.paidAmount + amount;
        if (newPaidAmount > sale.grandTotal) {
            return res.status(400).json({
                success: false,
                message: "Payment amount exceeds total amount"
            });
        }
        
        sale.paidAmount = newPaidAmount;
        if (paymentMethod) sale.paymentMethod = paymentMethod;
        if (notes) {
            sale.notes = (sale.notes || '') + `\nPayment recorded: ${amount} on ${new Date().toLocaleDateString()} - ${notes}`;
        }
        
        await sale.save(); // Pre-save hook will update payment status
        
        res.status(200).json({
            success: true,
            message: "Payment recorded successfully",
            data: {
                invoiceNumber: sale.invoiceNumber,
                paidAmount: sale.paidAmount,
                remainingAmount: sale.remainingAmount,
                paymentStatus: sale.paymentStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error recording payment",
            error: error.message
        });
    }
};

// Cancel sale
exports.cancelSale = async (req, res) => {
    try {
        const { reason } = req.body;
        
        const sale = await Sales.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            });
        }
        
        if (sale.status === 'cancelled' || sale.status === 'returned') {
            return res.status(400).json({
                success: false,
                message: "Sale is already cancelled or returned"
            });
        }
        
        // Restore stock for each item
        for (const item of sale.items) {
            const product = await Product.findById(item.product);
            if (product) {
                const previousStock = product.currentStock;
                product.currentStock += item.quantity;
                await product.save();
                
                // Create reverse stock transaction
                await StockTransaction.create({
                    product: product._id,
                    transactionType: 'return',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    previousStock,
                    newStock: product.currentStock,
                    reference: sale.invoiceNumber,
                    notes: `Stock restored due to sale cancellation: ${sale.invoiceNumber}. Reason: ${reason}`,
                    performedBy: req.user.id
                });
            }
        }
        
        sale.status = 'cancelled';
        if (reason) {
            sale.notes = (sale.notes || '') + `\nCancellation reason: ${reason}`;
        }
        
        await sale.save();
        
        res.status(200).json({
            success: true,
            message: "Sale cancelled successfully",
            data: sale
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error cancelling sale",
            error: error.message
        });
    }
};

// Get sales statistics
exports.getSalesStats = async (req, res) => {
    try {
        const { period = 'today' } = req.query;
        
        let dateFilter = {};
        const now = new Date();
        
        switch (period) {
            case 'today':
                dateFilter = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                    $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                };
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateFilter = { $gte: weekAgo };
                break;
            case 'month':
                dateFilter = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1)
                };
                break;
            case 'year':
                dateFilter = {
                    $gte: new Date(now.getFullYear(), 0, 1)
                };
                break;
        }
        
        const stats = await Sales.aggregate([
            {
                $match: {
                    saleDate: dateFilter,
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$grandTotal" },
                    totalPaid: { $sum: "$paidAmount" },
                    pendingAmount: { $sum: { $subtract: ["$grandTotal", "$paidAmount"] } }
                }
            }
        ]);
        
        const result = stats[0] || {
            totalSales: 0,
            totalRevenue: 0,
            totalPaid: 0,
            pendingAmount: 0
        };
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching sales statistics",
            error: error.message
        });
    }
};
