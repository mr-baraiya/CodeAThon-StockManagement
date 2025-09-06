const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

// All routes require authentication
router.use(authenticateToken);

// Get all suppliers
router.get("/", supplierController.getAllSuppliers);

// Get single supplier by ID
router.get("/:id", supplierController.getSupplierById);

// Get supplier statistics
router.get("/:id/stats", supplierController.getSupplierStats);

// Admin only routes
router.use(isAdmin);

// Create new supplier
router.post("/", supplierController.createSupplier);

// Update supplier
router.put("/:id", supplierController.updateSupplier);

// Delete supplier
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;
