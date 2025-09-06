const Supplier = require("../models/supplier.model");
const mongoose = require("mongoose");

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
    try {
        const { status = 'active', search, page = 1, limit = 10 } = req.query;
        
        let query = {};
        if (status !== 'all') {
            query.status = status;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { contactPerson: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const suppliers = await Supplier.find(query)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limitNum);
        
        const total = await Supplier.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: suppliers,
            pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                count: suppliers.length,
                totalRecords: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching suppliers",
            error: error.message
        });
    }
};

// Get single supplier by ID
exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        
        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: supplier
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching supplier",
            error: error.message
        });
    }
};

// Create new supplier
exports.createSupplier = async (req, res) => {
    try {
        const {
            name,
            contactPerson,
            email,
            phone,
            address,
            gstNumber,
            paymentTerms,
            notes
        } = req.body;
        
        // Check if supplier with same email already exists
        if (email) {
            const existingSupplier = await Supplier.findOne({ email });
            if (existingSupplier) {
                return res.status(400).json({
                    success: false,
                    message: "Supplier with this email already exists"
                });
            }
        }
        
        const supplier = new Supplier({
            name: name.trim(),
            contactPerson: contactPerson?.trim(),
            email,
            phone,
            address,
            gstNumber,
            paymentTerms,
            notes
        });
        
        await supplier.save();
        
        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: supplier
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating supplier",
            error: error.message
        });
    }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
    try {
        const {
            name,
            contactPerson,
            email,
            phone,
            address,
            gstNumber,
            paymentTerms,
            status,
            notes
        } = req.body;
        
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }
        
        // Check if email is being changed and if new email already exists
        if (email && email !== supplier.email) {
            const existingSupplier = await Supplier.findOne({
                email,
                _id: { $ne: req.params.id }
            });
            if (existingSupplier) {
                return res.status(400).json({
                    success: false,
                    message: "Supplier with this email already exists"
                });
            }
        }
        
        // Update fields
        if (name) supplier.name = name.trim();
        if (contactPerson !== undefined) supplier.contactPerson = contactPerson?.trim();
        if (email !== undefined) supplier.email = email;
        if (phone) supplier.phone = phone;
        if (address) supplier.address = { ...supplier.address, ...address };
        if (gstNumber !== undefined) supplier.gstNumber = gstNumber;
        if (paymentTerms) supplier.paymentTerms = paymentTerms;
        if (status) supplier.status = status;
        if (notes !== undefined) supplier.notes = notes;
        
        await supplier.save();
        
        res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: supplier
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating supplier",
            error: error.message
        });
    }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }
        
        // Check if supplier is used by any products
        const Product = require("../models/product.model");
        const productsUsingSupplier = await Product.find({ supplier: req.params.id });
        if (productsUsingSupplier.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete supplier. It is being used by products."
            });
        }
        
        // Check if supplier has any purchase orders
        const PurchaseOrder = require("../models/purchaseOrder.model");
        const purchaseOrders = await PurchaseOrder.find({ supplier: req.params.id });
        if (purchaseOrders.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete supplier. It has associated purchase orders."
            });
        }
        
        await Supplier.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: "Supplier deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting supplier",
            error: error.message
        });
    }
};

// Get supplier statistics
exports.getSupplierStats = async (req, res) => {
    try {
        const supplierId = req.params.id;
        
        // Get product count
        const Product = require("../models/product.model");
        const productCount = await Product.countDocuments({ supplier: supplierId });
        
        // Get purchase order statistics
        const PurchaseOrder = require("../models/purchaseOrder.model");
        const purchaseStats = await PurchaseOrder.aggregate([
            { $match: { supplier: mongoose.Types.ObjectId(supplierId) } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" },
                    pendingOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
                        }
                    },
                    completedOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "received"] }, 1, 0]
                        }
                    }
                }
            }
        ]);
        
        const stats = {
            productCount,
            purchaseOrders: purchaseStats[0] || {
                totalOrders: 0,
                totalAmount: 0,
                pendingOrders: 0,
                completedOrders: 0
            }
        };
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching supplier statistics",
            error: error.message
        });
    }
};
