const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: [true, "Invoice number is required"],
        unique: true,
        trim: true,
        uppercase: true
    },
    customer: {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            maxlength: [100, "Customer name must be at most 100 characters"]
        },
        phone: {
            type: String,
            maxlength: [15, "Customer phone must be at most 15 characters"]
        },
        email: {
            type: String,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
        },
        address: {
            type: String,
            maxlength: [200, "Customer address must be at most 200 characters"]
        },
        gstNumber: {
            type: String,
            maxlength: [15, "GST number must be at most 15 characters"]
        }
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be positive"]
        },
        unitPrice: {
            type: Number,
            required: true,
            min: [0, "Unit price cannot be negative"]
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, "Discount cannot be negative"]
        },
        taxRate: {
            type: Number,
            default: 0,
            min: [0, "Tax rate cannot be negative"],
            max: [100, "Tax rate cannot exceed 100%"]
        },
        taxAmount: {
            type: Number,
            default: 0,
            min: [0, "Tax amount cannot be negative"]
        },
        totalPrice: {
            type: Number,
            required: true,
            min: [0, "Total price cannot be negative"]
        }
    }],
    saleDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Subtotal cannot be negative"]
    },
    totalDiscount: {
        type: Number,
        default: 0,
        min: [0, "Total discount cannot be negative"]
    },
    totalTax: {
        type: Number,
        default: 0,
        min: [0, "Total tax cannot be negative"]
    },
    grandTotal: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Grand total cannot be negative"]
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank_transfer', 'credit'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'overdue'],
        default: 'pending'
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: [0, "Paid amount cannot be negative"]
    },
    status: {
        type: String,
        enum: ['draft', 'confirmed', 'cancelled', 'returned'],
        default: 'confirmed'
    },
    notes: {
        type: String,
        maxlength: [500, "Notes must be at most 500 characters"]
    },
    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sold by user is required"]
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

// Virtual for remaining amount
salesSchema.virtual('remainingAmount').get(function() {
    return this.grandTotal - this.paidAmount;
});

// Virtual for profit calculation
salesSchema.virtual('totalProfit').get(function() {
    // This would need to be calculated based on cost prices of products
    // For now, returning 0 - implement based on your business logic
    return 0;
});

// Ensure virtual fields are serialized
salesSchema.set('toJSON', { virtuals: true });
salesSchema.set('toObject', { virtuals: true });

// Pre-save hook to calculate totals
salesSchema.pre('save', function(next) {
    // Calculate item totals
    this.items.forEach(item => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = item.discount;
        const itemAfterDiscount = itemSubtotal - itemDiscount;
        item.taxAmount = (itemAfterDiscount * item.taxRate) / 100;
        item.totalPrice = itemAfterDiscount + item.taxAmount;
    });
    
    // Calculate totals
    this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    this.totalDiscount = this.items.reduce((sum, item) => sum + item.discount, 0);
    this.totalTax = this.items.reduce((sum, item) => sum + item.taxAmount, 0);
    this.grandTotal = this.subtotal - this.totalDiscount + this.totalTax;
    
    // Update payment status
    if (this.paidAmount >= this.grandTotal) {
        this.paymentStatus = 'paid';
    } else if (this.paidAmount > 0) {
        this.paymentStatus = 'partial';
    } else {
        this.paymentStatus = 'pending';
    }
    
    next();
});

// Generate invoice number
salesSchema.statics.generateInvoiceNumber = async function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `INV${year}${month}${day}`;
    
    // Find the latest invoice number for today
    const latestInvoice = await this.findOne({
        invoiceNumber: new RegExp(`^${prefix}`)
    }).sort({ invoiceNumber: -1 });
    
    let sequence = 1;
    if (latestInvoice) {
        const lastSequence = parseInt(latestInvoice.invoiceNumber.substring(prefix.length));
        sequence = lastSequence + 1;
    }
    
    return `${prefix}${String(sequence).padStart(3, '0')}`;
};

// Indexes for better performance
salesSchema.index({ invoiceNumber: 1 });
salesSchema.index({ saleDate: -1 });
salesSchema.index({ paymentStatus: 1, dueDate: 1 });
salesSchema.index({ soldBy: 1, saleDate: -1 });

module.exports = mongoose.model("Sales", salesSchema);
