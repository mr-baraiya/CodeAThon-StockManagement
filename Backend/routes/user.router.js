const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const verifyToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const { 
    validateRegister, 
    validateLogin, 
    validateUpdate, 
    validatePasswordChange, 
    handleValidationErrors 
} = require("../middlewares/validation");

// Public routes
router.post("/register", validateRegister, handleValidationErrors, controller.register);
router.post("/login", validateLogin, handleValidationErrors, controller.login);

// Protected routes (for logged-in users)
router.get("/profile/me", verifyToken, controller.getProfile);
router.get("/:id", verifyToken, controller.getUserById);
router.put("/:id", verifyToken, validateUpdate, handleValidationErrors, controller.updateUser);
router.put("/:id/password", verifyToken, validatePasswordChange, handleValidationErrors, controller.changePassword);

// Admin-only routes
router.get("/", verifyToken, isAdmin, controller.getAllUsers);
router.get("/search/users", verifyToken, isAdmin, controller.searchUsers);
router.get("/role/:role", verifyToken, isAdmin, controller.getUsersByRole);
router.patch("/:id/status", verifyToken, isAdmin, controller.toggleStatus);
router.delete("/:id", verifyToken, isAdmin, controller.deleteUser);

module.exports = router;
