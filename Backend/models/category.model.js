const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        trim: true,
        minlength: [2, "Category name must be at least 2 characters"],
        maxlength: [50, "Category name must be at most 50 characters"]
    },
    description: {
        type: String,
        maxlength: [200, "Description must be at most 200 characters"]
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null // null for main categories, ObjectId for subcategories
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    image: {
        type: String // URL to category image
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategory'
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Category", categorySchema);
