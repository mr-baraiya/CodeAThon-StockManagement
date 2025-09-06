const Product = require("../models/product.model");
const StockTransaction = require("../models/stockTransaction.model");

// Get all products with filtering and pagination
exports.getAllProducts = async (req, res) => {
    try {
        const {
            status = 'active',
            category,
            supplier,
            lowStock,
            search,
            page = 1,
            limit = 20,
            sortBy = 'name',
            sortOrder = 'asc'
        } = req.query;
        
        let query = {};
        if (status !== 'all') {
            query.status = status;
        }
        
        if (category) {
            query.category = category;
        }
        
        if (supplier) {
            query.supplier = supplier;
        }
        
        if (lowStock === 'true') {
            query.$expr = { $lte: ["$currentStock", "$minStockLevel"] };
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } }
            ];
        }
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('supplier', 'name')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);
        
        const total = await Product.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                count: products.length,
                totalRecords: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name description')
            .populate('supplier', 'name contactPerson phone email');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message
        });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            barcode,
            description,
            category,
            supplier,
            unit,
            costPrice,
            sellingPrice,
            currentStock = 0,
            minStockLevel,
            maxStockLevel,
            reorderPoint,
            taxRate,
            images,
            batch,
            location,
            tags
        } = req.body;
        
        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "Product with this SKU already exists"
            });
        }
        
        // Check if barcode already exists (if provided)
        if (barcode) {
            const existingBarcode = await Product.findOne({ barcode });
            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: "Product with this barcode already exists"
                });
            }
        }
        
        const product = new Product({
            name: name.trim(),
            sku: sku.toUpperCase(),
            barcode,
            description,
            category,
            supplier,
            unit,
            costPrice,
            sellingPrice,
            currentStock,
            minStockLevel,
            maxStockLevel,
            reorderPoint,
            taxRate,
            images,
            batch,
            location,
            tags
        });
        
        await product.save();
        
        // Create initial stock transaction if currentStock > 0
        if (currentStock > 0) {
            await StockTransaction.create({
                product: product._id,
                transactionType: 'stock_in',
                quantity: currentStock,
                unitPrice: costPrice,
                previousStock: 0,
                newStock: currentStock,
                reference: 'Initial Stock',
                notes: 'Initial stock entry',
                performedBy: req.user.id
            });
        }
        
        await product.populate('category', 'name');
        await product.populate('supplier', 'name');
        
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating product",
            error: error.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            barcode,
            description,
            category,
            supplier,
            unit,
            costPrice,
            sellingPrice,
            minStockLevel,
            maxStockLevel,
            reorderPoint,
            taxRate,
            images,
            batch,
            location,
            status,
            tags
        } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        
        // Check if SKU is being changed and if new SKU already exists
        if (sku && sku.toUpperCase() !== product.sku) {
            const existingProduct = await Product.findOne({
                sku: sku.toUpperCase(),
                _id: { $ne: req.params.id }
            });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: "Product with this SKU already exists"
                });
            }
        }
        
        // Check if barcode is being changed and if new barcode already exists
        if (barcode && barcode !== product.barcode) {
            const existingBarcode = await Product.findOne({
                barcode,
                _id: { $ne: req.params.id }
            });
            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: "Product with this barcode already exists"
                });
            }
        }
        
        // Update fields
        if (name) product.name = name.trim();
        if (sku) product.sku = sku.toUpperCase();
        if (barcode !== undefined) product.barcode = barcode;
        if (description !== undefined) product.description = description;
        if (category) product.category = category;
        if (supplier) product.supplier = supplier;
        if (unit) product.unit = unit;
        if (costPrice !== undefined) product.costPrice = costPrice;
        if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;
        if (minStockLevel !== undefined) product.minStockLevel = minStockLevel;
        if (maxStockLevel !== undefined) product.maxStockLevel = maxStockLevel;
        if (reorderPoint !== undefined) product.reorderPoint = reorderPoint;
        if (taxRate !== undefined) product.taxRate = taxRate;
        if (images) product.images = images;
        if (batch) product.batch = { ...product.batch, ...batch };
        if (location) product.location = { ...product.location, ...location };
        if (status) product.status = status;
        if (tags) product.tags = tags;
        
        await product.save();
        
        await product.populate('category', 'name');
        await product.populate('supplier', 'name');
        
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        
        // Check if product has any stock transactions
        const hasTransactions = await StockTransaction.findOne({ product: req.params.id });
        if (hasTransactions) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete product. It has stock transaction history."
            });
        }
        
        await Product.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
};

// Update stock (stock in/out)
exports.updateStock = async (req, res) => {
    try {
        const { type, quantity, unitPrice, reference, notes, supplier } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        
        const previousStock = product.currentStock;
        let newStock;
        
        if (type === 'stock_in') {
            newStock = previousStock + quantity;
        } else if (type === 'stock_out') {
            if (quantity > previousStock) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot remove more stock than available"
                });
            }
            newStock = previousStock - quantity;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction type. Use 'stock_in' or 'stock_out'"
            });
        }
        
        // Update product stock
        product.currentStock = newStock;
        await product.save();
        
        // Create stock transaction record
        await StockTransaction.create({
            product: product._id,
            transactionType: type,
            quantity,
            unitPrice: unitPrice || product.costPrice,
            previousStock,
            newStock,
            reference,
            supplier,
            notes,
            performedBy: req.user.id
        });
        
        res.status(200).json({
            success: true,
            message: `Stock ${type === 'stock_in' ? 'added' : 'removed'} successfully`,
            data: {
                product: product.name,
                previousStock,
                newStock,
                quantity
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating stock",
            error: error.message
        });
    }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            status: 'active',
            $expr: { $lte: ["$currentStock", "$minStockLevel"] }
        })
        .populate('category', 'name')
        .populate('supplier', 'name')
        .sort({ currentStock: 1 });
        
        res.status(200).json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching low stock products",
            error: error.message
        });
    }
};

// Get product stock history
exports.getStockHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const transactions = await StockTransaction.find({ product: req.params.id })
            .populate('performedBy', 'name')
            .populate('supplier', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        
        const total = await StockTransaction.countDocuments({ product: req.params.id });
        
        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                count: transactions.length,
                totalRecords: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching stock history",
            error: error.message
        });
    }
};
