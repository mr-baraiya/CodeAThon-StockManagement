const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

// All routes require authentication
router.use(authenticateToken);

// Get all products
router.get("/", productController.getAllProducts);

// Get low stock products
router.get("/low-stock", productController.getLowStockProducts);

// Get single product by ID
router.get("/:id", productController.getProductById);

// Get product stock history
router.get("/:id/stock-history", productController.getStockHistory);

// Update stock (stock in/out) - staff can do this
router.patch("/:id/stock", productController.updateStock);

// Admin only routes
router.use(isAdmin);

// Create new product
router.post("/", productController.createProduct);

// Update product
router.put("/:id", productController.updateProduct);

// Delete product
router.delete("/:id", productController.deleteProduct);

module.exports = router;
