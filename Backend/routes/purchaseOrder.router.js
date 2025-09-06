const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrder.controller");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

// All routes require authentication
router.use(authenticateToken);

// Get all purchase orders
router.get("/", purchaseOrderController.getAllPurchaseOrders);

// Get single purchase order by ID
router.get("/:id", purchaseOrderController.getPurchaseOrderById);

// Receive goods (staff can do this)
router.patch("/:id/receive", purchaseOrderController.receiveGoods);

// Admin only routes
router.use(isAdmin);

// Create new purchase order
router.post("/", purchaseOrderController.createPurchaseOrder);

// Update purchase order
router.put("/:id", purchaseOrderController.updatePurchaseOrder);

// Cancel purchase order
router.patch("/:id/cancel", purchaseOrderController.cancelPurchaseOrder);

// Delete purchase order
router.delete("/:id", purchaseOrderController.deletePurchaseOrder);

module.exports = router;
