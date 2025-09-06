const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Supplier name is required"],
        trim: true,
        minlength: [2, "Supplier name must be at least 2 characters"],
        maxlength: [100, "Supplier name must be at most 100 characters"]
    },
    contactPerson: {
        type: String,
        trim: true,
        maxlength: [50, "Contact person name must be at most 50 characters"]
    },
    email: {
        type: String,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        unique: true,
        sparse: true // allows multiple documents with null email
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\d{10,15}$/, "Phone must be 10-15 digits"]
    },
    address: {
        street: { type: String, maxlength: [100, "Street must be at most 100 characters"] },
        city: { type: String, maxlength: [50, "City must be at most 50 characters"] },
        state: { type: String, maxlength: [50, "State must be at most 50 characters"] },
        zipCode: { type: String, maxlength: [10, "Zip code must be at most 10 characters"] },
        country: { type: String, maxlength: [50, "Country must be at most 50 characters"] }
    },
    gstNumber: {
        type: String,
        maxlength: [15, "GST number must be at most 15 characters"]
    },
    paymentTerms: {
        type: String,
        enum: ['cash', 'credit_7', 'credit_15', 'credit_30', 'credit_60', 'credit_90'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    notes: {
        type: String,
        maxlength: [500, "Notes must be at most 500 characters"]
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

// Index for faster searches
supplierSchema.index({ name: 1, status: 1 });

module.exports = mongoose.model("Supplier", supplierSchema);
