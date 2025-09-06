const { body, validationResult } = require("express-validator");

// Validation rules for user registration
const validateRegister = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name can only contain letters and spaces"),
    
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please enter a valid email address"),
    
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    
    body("phone")
        .optional()
        .matches(/^\d{10}$/)
        .withMessage("Phone number must be exactly 10 digits"),
    
    body("location")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Location must be at most 100 characters")
];

// Validation rules for user login
const validateLogin = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please enter a valid email address"),
    
    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

// Validation rules for updating user profile
const validateUpdate = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name can only contain letters and spaces"),
    
    body("phone")
        .optional()
        .matches(/^\d{10}$/)
        .withMessage("Phone number must be exactly 10 digits"),
    
    body("location")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Location must be at most 100 characters"),
    
    body("profileImage")
        .optional()
        .isURL()
        .withMessage("Profile image must be a valid URL")
];

// Validation rules for password change
const validatePasswordChange = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number")
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation errors",
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdate,
    validatePasswordChange,
    handleValidationErrors
};
