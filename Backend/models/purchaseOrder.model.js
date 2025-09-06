const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: [true, "Order number is required"],
        unique: true,
        trim: true,
        uppercase: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: [true, "Supplier is required"]
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
        totalPrice: {
            type: Number,
            required: true,
            min: [0, "Total price cannot be negative"]
        },
        receivedQuantity: {
            type: Number,
            default: 0,
            min: [0, "Received quantity cannot be negative"]
        }
    }],
    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expectedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'partial_received', 'received', 'cancelled'],
        default: 'pending'
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Subtotal cannot be negative"]
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: [0, "Tax amount cannot be negative"]
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: [0, "Discount amount cannot be negative"]
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Total amount cannot be negative"]
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending'
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: [0, "Paid amount cannot be negative"]
    },
    notes: {
        type: String,
        maxlength: [500, "Notes must be at most 500 characters"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Created by user is required"]
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

// Virtual for remaining amount
purchaseOrderSchema.virtual('remainingAmount').get(function() {
    return this.totalAmount - this.paidAmount;
});

// Virtual for is fully received
purchaseOrderSchema.virtual('isFullyReceived').get(function() {
    return this.items.every(item => item.receivedQuantity >= item.quantity);
});

// Ensure virtual fields are serialized
purchaseOrderSchema.set('toJSON', { virtuals: true });
purchaseOrderSchema.set('toObject', { virtuals: true });

// Pre-save hook to calculate totals
purchaseOrderSchema.pre('save', function(next) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calculate total amount
    this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
    
    // Update status based on received quantities
    if (this.items.length > 0) {
        const allReceived = this.items.every(item => item.receivedQuantity >= item.quantity);
        const anyReceived = this.items.some(item => item.receivedQuantity > 0);
        
        if (allReceived && this.status !== 'cancelled') {
            this.status = 'received';
        } else if (anyReceived && this.status !== 'cancelled') {
            this.status = 'partial_received';
        }
    }
    
    next();
});

// Generate order number
purchaseOrderSchema.statics.generateOrderNumber = async function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `PO${year}${month}${day}`;
    
    // Find the latest order number for today
    const latestOrder = await this.findOne({
        orderNumber: new RegExp(`^${prefix}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (latestOrder) {
        const lastSequence = parseInt(latestOrder.orderNumber.substring(prefix.length));
        sequence = lastSequence + 1;
    }
    
    return `${prefix}${String(sequence).padStart(3, '0')}`;
};

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
