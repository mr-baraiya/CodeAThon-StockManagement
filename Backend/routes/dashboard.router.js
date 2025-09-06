const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authenticateToken = require("../middlewares/auth");

// All routes require authentication
router.use(authenticateToken);

// Get dashboard overview
router.get("/overview", dashboardController.getDashboardOverview);

// Get inventory report
router.get("/inventory-report", dashboardController.getInventoryReport);

// Get sales report
router.get("/sales-report", dashboardController.getSalesReport);

// Get purchase report
router.get("/purchase-report", dashboardController.getPurchaseReport);

// Get profit & loss report
router.get("/profit-loss-report", dashboardController.getProfitLossReport);

module.exports = router;
