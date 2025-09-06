const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ 
                success: false, 
                message: "Access denied. No valid token provided." 
            });
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info to request object
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false, 
                message: "Token has expired" 
            });
        }
        
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Server error during authentication" 
        });
    }
};

module.exports = verifyToken;
