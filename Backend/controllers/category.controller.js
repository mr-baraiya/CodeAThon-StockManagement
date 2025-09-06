const Category = require("../models/category.model");

// Get all categories with subcategories
exports.getAllCategories = async (req, res) => {
    try {
        const { status = 'active', includeSubcategories = true } = req.query;
        
        let query = {};
        if (status !== 'all') {
            query.status = status;
        }
        
        const categories = await Category.find({ ...query, parentCategory: null })
            .populate(includeSubcategories === 'true' ? 'subcategories' : '')
            .sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
    }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('subcategories')
            .populate('parentCategory', 'name');
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching category",
            error: error.message
        });
    }
};

// Create new category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, parentCategory, image } = req.body;
        
        // Check if category name already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }
        
        // If parentCategory is provided, check if it exists
        if (parentCategory) {
            const parent = await Category.findById(parentCategory);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: "Parent category not found"
                });
            }
        }
        
        const category = new Category({
            name: name.trim(),
            description,
            parentCategory: parentCategory || null,
            image
        });
        
        await category.save();
        
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating category",
            error: error.message
        });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, parentCategory, image, status } = req.body;
        
        // Check if category exists
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        
        // Check if new name already exists (excluding current category)
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: name.trim(),
                _id: { $ne: req.params.id }
            });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category with this name already exists"
                });
            }
        }
        
        // If parentCategory is provided, check if it exists and not same as current category
        if (parentCategory && parentCategory !== category.parentCategory?.toString()) {
            if (parentCategory === req.params.id) {
                return res.status(400).json({
                    success: false,
                    message: "Category cannot be its own parent"
                });
            }
            
            const parent = await Category.findById(parentCategory);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: "Parent category not found"
                });
            }
        }
        
        // Update fields
        if (name) category.name = name.trim();
        if (description !== undefined) category.description = description;
        if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
        if (image !== undefined) category.image = image;
        if (status) category.status = status;
        
        await category.save();
        
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating category",
            error: error.message
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        
        // Check if category has subcategories
        const subcategories = await Category.find({ parentCategory: req.params.id });
        if (subcategories.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with subcategories. Delete subcategories first."
            });
        }
        
        // Check if category is used by any products
        const Product = require("../models/product.model");
        const productsUsingCategory = await Product.find({ category: req.params.id });
        if (productsUsingCategory.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category. It is being used by products."
            });
        }
        
        await Category.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting category",
            error: error.message
        });
    }
};

// Get all subcategories of a category
exports.getSubcategories = async (req, res) => {
    try {
        const subcategories = await Category.find({ parentCategory: req.params.id })
            .sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            data: subcategories,
            count: subcategories.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching subcategories",
            error: error.message
        });
    }
};
