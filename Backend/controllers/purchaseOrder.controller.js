const PurchaseOrder = require("../models/purchaseOrder.model");
const Product = require("../models/product.model");
const StockTransaction = require("../models/stockTransaction.model");

// Get all purchase orders
exports.getAllPurchaseOrders = async (req, res) => {
    try {
        const {
            status,
            supplier,
            dateFrom,
            dateTo,
            page = 1,
            limit = 20
        } = req.query;
        
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (supplier) {
            query.supplier = supplier;
        }
        
        if (dateFrom || dateTo) {
            query.orderDate = {};
            if (dateFrom) query.orderDate.$gte = new Date(dateFrom);
            if (dateTo) query.orderDate.$lte = new Date(dateTo);
        }
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const purchaseOrders = await PurchaseOrder.find(query)
            .populate('supplier', 'name contactPerson phone')
            .populate('items.product', 'name sku')
            .populate('createdBy', 'name')
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limitNum);
        
        const total = await PurchaseOrder.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: purchaseOrders,
            pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                count: purchaseOrders.length,
                totalRecords: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching purchase orders",
            error: error.message
        });
    }
};

// Get single purchase order by ID
exports.getPurchaseOrderById = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findById(req.params.id)
            .populate('supplier')
            .populate('items.product', 'name sku unit')
            .populate('createdBy', 'name')
            .populate('receivedBy', 'name');
        
        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: "Purchase order not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: purchaseOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching purchase order",
            error: error.message
        });
    }
};

// Create new purchase order
exports.createPurchaseOrder = async (req, res) => {
    try {
        const {
            supplier,
            items,
            expectedDeliveryDate,
            discountAmount = 0,
            taxAmount = 0,
            notes
        } = req.body;
        
        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Purchase order must have at least one item"
            });
        }
        
        // Calculate item totals
        const processedItems = items.map(item => ({
            ...item,
            totalPrice: item.quantity * item.unitPrice
        }));
        
        // Generate order number
        const orderNumber = await PurchaseOrder.generateOrderNumber();
        
        const purchaseOrder = new PurchaseOrder({
            orderNumber,
            supplier,
            items: processedItems,
            expectedDeliveryDate,
            discountAmount,
            taxAmount,
            notes,
            createdBy: req.user.id
        });
        
        await purchaseOrder.save();
        
        await purchaseOrder.populate('supplier', 'name');
        await purchaseOrder.populate('items.product', 'name sku');
        await purchaseOrder.populate('createdBy', 'name');
        
        res.status(201).json({
            success: true,
            message: "Purchase order created successfully",
            data: purchaseOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating purchase order",
            error: error.message
        });
    }
};

// Update purchase order
exports.updatePurchaseOrder = async (req, res) => {
    try {
        const {
            supplier,
            items,
            expectedDeliveryDate,
            discountAmount,
            taxAmount,
            status,
            notes
        } = req.body;
        
        const purchaseOrder = await PurchaseOrder.findById(req.params.id);
        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: "Purchase order not found"
            });
        }
        
        // Check if order can be modified
        if (purchaseOrder.status === 'received' || purchaseOrder.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Cannot modify received or cancelled purchase orders"
            });
        }
        
        // Update fields
        if (supplier) purchaseOrder.supplier = supplier;
        if (items) {
            purchaseOrder.items = items.map(item => ({
                ...item,
                totalPrice: item.quantity * item.unitPrice
            }));
        }
        if (expectedDeliveryDate !== undefined) purchaseOrder.expectedDeliveryDate = expectedDeliveryDate;
        if (discountAmount !== undefined) purchaseOrder.discountAmount = discountAmount;
        if (taxAmount !== undefined) purchaseOrder.taxAmount = taxAmount;
        if (status) purchaseOrder.status = status;
        if (notes !== undefined) purchaseOrder.notes = notes;
        
        await purchaseOrder.save();
        
        await purchaseOrder.populate('supplier', 'name');
        await purchaseOrder.populate('items.product', 'name sku');
        
        res.status(200).json({
            success: true,
            message: "Purchase order updated successfully",
            data: purchaseOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating purchase order",
            error: error.message
        });
    }
};

// Receive goods (partial or full)
exports.receiveGoods = async (req, res) => {
    try {
        const { receivedItems } = req.body; // Array of { productId, receivedQuantity }
        
        const purchaseOrder = await PurchaseOrder.findById(req.params.id);
        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: "Purchase order not found"
            });
        }
        
        if (purchaseOrder.status === 'received' || purchaseOrder.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Cannot receive goods for this purchase order"
            });
        }
        
        // Update received quantities and stock
        for (const receivedItem of receivedItems) {
            const orderItem = purchaseOrder.items.find(
                item => item.product.toString() === receivedItem.productId
            );
            
            if (!orderItem) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${receivedItem.productId} not found in purchase order`
                });
            }
            
            // Check if received quantity is valid
            const totalReceived = orderItem.receivedQuantity + receivedItem.receivedQuantity;
            if (totalReceived > orderItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot receive more than ordered quantity for product ${receivedItem.productId}`
                });
            }
            
            // Update received quantity
            orderItem.receivedQuantity = totalReceived;
            
            // Update product stock
            const product = await Product.findById(receivedItem.productId);
            if (product) {
                const previousStock = product.currentStock;
                product.currentStock += receivedItem.receivedQuantity;
                await product.save();
                
                // Create stock transaction
                await StockTransaction.create({
                    product: product._id,
                    transactionType: 'purchase',
                    quantity: receivedItem.receivedQuantity,
                    unitPrice: orderItem.unitPrice,
                    previousStock,
                    newStock: product.currentStock,
                    reference: purchaseOrder.orderNumber,
                    supplier: purchaseOrder.supplier,
                    notes: `Goods received for PO ${purchaseOrder.orderNumber}`,
                    performedBy: req.user.id
                });
            }
        }
        
        // Update purchase order
        purchaseOrder.receivedBy = req.user.id;
        purchaseOrder.actualDeliveryDate = new Date();
        await purchaseOrder.save(); // Pre-save hook will update status
        
        res.status(200).json({
            success: true,
            message: "Goods received successfully",
            data: purchaseOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error receiving goods",
            error: error.message
        });
    }
};

// Cancel purchase order
exports.cancelPurchaseOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        
        const purchaseOrder = await PurchaseOrder.findById(req.params.id);
        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: "Purchase order not found"
            });
        }
        
        if (purchaseOrder.status === 'received') {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel received purchase order"
            });
        }
        
        purchaseOrder.status = 'cancelled';
        if (reason) {
            purchaseOrder.notes = (purchaseOrder.notes || '') + `\nCancellation reason: ${reason}`;
        }
        
        await purchaseOrder.save();
        
        res.status(200).json({
            success: true,
            message: "Purchase order cancelled successfully",
            data: purchaseOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error cancelling purchase order",
            error: error.message
        });
    }
};

// Delete purchase order
exports.deletePurchaseOrder = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findById(req.params.id);
        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: "Purchase order not found"
            });
        }
        
        // Only allow deletion of pending or cancelled orders
        if (purchaseOrder.status === 'received' || purchaseOrder.status === 'partial_received') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete purchase order with received goods"
            });
        }
        
        await PurchaseOrder.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: "Purchase order deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting purchase order",
            error: error.message
        });
    }
};
