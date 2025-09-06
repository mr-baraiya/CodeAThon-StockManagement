const User = require("../models/user.model");

const isStaffOrAbove = async (req, res, next) => {
    try {
        // Get user ID from the token (set by verifyToken middleware)
        const userId = req.user.userId;
        
        // Find user in database
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if user is staff, manager, or admin
        if (!['staff', 'manager', 'admin'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Staff privileges required."
            });
        }
        
        // Add user to request object for further use
        req.currentUser = user;
        next();
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error during authorization",
            error: error.message
        });
    }
};

module.exports = { isStaffOrAbove };
