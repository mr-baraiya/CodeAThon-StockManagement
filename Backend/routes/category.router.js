const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

// Get all categories (public route for display)
router.get("/", categoryController.getAllCategories);

// Get single category by ID
router.get("/:id", categoryController.getCategoryById);

// Get subcategories of a category
router.get("/:id/subcategories", categoryController.getSubcategories);

// Protected routes (require authentication)
router.use(authenticateToken);

// Create new category (admin only)
router.post("/", isAdmin, categoryController.createCategory);

// Update category (admin only)
router.put("/:id", isAdmin, categoryController.updateCategory);

// Delete category (admin only)
router.delete("/:id", isAdmin, categoryController.deleteCategory);

module.exports = router;
