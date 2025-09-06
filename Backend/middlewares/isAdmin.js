const User = require("../models/user.model");

const isAdmin = async (req, res, next) => {
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
        
        // Check if user is admin or manager
        if (user.role !== 'admin' && user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin or Manager privileges required."
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

module.exports = isAdmin;
