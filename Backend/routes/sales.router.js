const express = require("express");
const router = express.Router();
const salesController = require("../controllers/sales.controller");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

// All routes require authentication
router.use(authenticateToken);

// Get all sales
router.get("/", salesController.getAllSales);

// Get sales statistics
router.get("/stats", salesController.getSalesStats);

// Get single sale by ID
router.get("/:id", salesController.getSaleById);

// Create new sale (staff can do this)
router.post("/", salesController.createSale);

// Record payment (staff can do this)
router.patch("/:id/payment", salesController.recordPayment);

// Admin only routes
router.use(isAdmin);

// Update sale
router.put("/:id", salesController.updateSale);

// Cancel sale
router.patch("/:id/cancel", salesController.cancelSale);

module.exports = router;
