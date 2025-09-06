const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product is required"]
    },
    transactionType: {
        type: String,
        required: [true, "Transaction type is required"],
        enum: ['stock_in', 'stock_out', 'adjustment', 'purchase', 'sale', 'return', 'damaged', 'transfer']
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be positive"]
    },
    unitPrice: {
        type: Number,
        default: 0,
        min: [0, "Unit price cannot be negative"]
    },
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, "Total amount cannot be negative"]
    },
    previousStock: {
        type: Number,
        required: true,
        min: [0, "Previous stock cannot be negative"]
    },
    newStock: {
        type: Number,
        required: true,
        min: [0, "New stock cannot be negative"]
    },
    reference: {
        type: String, // Purchase Order ID, Sale ID, etc.
        maxlength: [100, "Reference must be at most 100 characters"]
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier"
    },
    customer: {
        name: { type: String, maxlength: [100, "Customer name must be at most 100 characters"] },
        phone: { type: String, maxlength: [15, "Customer phone must be at most 15 characters"] },
        email: { type: String }
    },
    notes: {
        type: String,
        maxlength: [500, "Notes must be at most 500 characters"]
    },
    batch: {
        batchNumber: { type: String },
        expiryDate: { type: Date }
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User who performed the transaction is required"]
    },
    location: {
        warehouse: { type: String, default: "Main" },
        section: { type: String },
        shelf: { type: String }
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

// Indexes for better performance
stockTransactionSchema.index({ product: 1, createdAt: -1 });
stockTransactionSchema.index({ transactionType: 1, createdAt: -1 });
stockTransactionSchema.index({ performedBy: 1, createdAt: -1 });

// Pre-save hook to calculate total amount
stockTransactionSchema.pre('save', function(next) {
    this.totalAmount = this.quantity * this.unitPrice;
    next();
});

module.exports = mongoose.model("StockTransaction", stockTransactionSchema);
