const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        minlength: [2, "Product name must be at least 2 characters"],
        maxlength: [100, "Product name must be at most 100 characters"]
    },
    sku: {
        type: String,
        required: [true, "SKU is required"],
        unique: true,
        trim: true,
        uppercase: true,
        maxlength: [50, "SKU must be at most 50 characters"]
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true, // allows multiple documents with null barcode
        maxlength: [50, "Barcode must be at most 50 characters"]
    },
    description: {
        type: String,
        maxlength: [500, "Description must be at most 500 characters"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"]
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: [true, "Supplier is required"]
    },
    unit: {
        type: String,
        required: [true, "Unit is required"],
        enum: ['piece', 'kg', 'gram', 'liter', 'ml', 'meter', 'cm', 'box', 'pack', 'dozen'],
        default: 'piece'
    },
    costPrice: {
        type: Number,
        required: [true, "Cost price is required"],
        min: [0, "Cost price must be positive"]
    },
    sellingPrice: {
        type: Number,
        required: [true, "Selling price is required"],
        min: [0, "Selling price must be positive"]
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Current stock cannot be negative"]
    },
    minStockLevel: {
        type: Number,
        required: true,
        default: 5,
        min: [0, "Minimum stock level must be positive"]
    },
    maxStockLevel: {
        type: Number,
        default: 1000,
        min: [0, "Maximum stock level must be positive"]
    },
    reorderPoint: {
        type: Number,
        default: 10,
        min: [0, "Reorder point must be positive"]
    },
    taxRate: {
        type: Number,
        default: 0,
        min: [0, "Tax rate cannot be negative"],
        max: [100, "Tax rate cannot exceed 100%"]
    },
    images: [{
        type: String // URLs to product images
    }],
    batch: {
        batchNumber: { type: String },
        manufacturingDate: { type: Date },
        expiryDate: { type: Date }
    },
    location: {
        warehouse: { type: String, default: "Main" },
        section: { type: String },
        shelf: { type: String }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued'],
        default: 'active'
    },
    tags: [{
        type: String,
        maxlength: [20, "Tag must be at most 20 characters"]
    }]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
    return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
});

// Virtual for low stock alert
productSchema.virtual('isLowStock').get(function() {
    return this.currentStock <= this.minStockLevel;
});

// Virtual for out of stock
productSchema.virtual('isOutOfStock').get(function() {
    return this.currentStock === 0;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Indexes for better performance
productSchema.index({ name: 1, sku: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ currentStock: 1, minStockLevel: 1 });

// Pre-save validation
productSchema.pre('save', function(next) {
    if (this.maxStockLevel && this.minStockLevel >= this.maxStockLevel) {
        next(new Error('Minimum stock level must be less than maximum stock level'));
    }
    if (this.costPrice >= this.sellingPrice) {
        console.warn('Warning: Cost price is equal to or greater than selling price');
    }
    next();
});

module.exports = mongoose.model("Product", productSchema);
