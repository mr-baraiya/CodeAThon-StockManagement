const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, location, role } = req.body;
        
        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: "Email already exists" 
            });
        }

        // Create user data (password will be hashed by pre-save hook)
        const userData = { 
            name, 
            email, 
            password, // Don't hash here - let pre-save hook handle it
            phone, 
            location 
        };
        
        // Only allow admin role if explicitly set and user is admin (add admin check later)
        if (role && role === 'admin') {
            userData.role = 'admin';
        }
        
        const user = await User.create(userData);
        
        res.status(201).json({ 
            success: true,
            message: "User registered successfully", 
            user: user.profile 
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error during registration",
            error: err.message 
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        // const { email, password } = req.body;
        
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password.trim();

        console.log("Login attempt for email:", email);
        
        // Find user by email
        console.log("Searching for user with email:", `"${email}"`);
        const user = await User.findOne({ email });
        console.log("User found:", user);
        if (!user) {
            console.log("User not found with email:", email);
            return res.status(404).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        console.log("User found:", user.email);

        // Check if user is active
        if (user.status === 'inactive') {
            console.log("User account is inactive");
            return res.status(403).json({ 
                success: false, 
                message: "Account is deactivated. Please contact support." 
            });
        }

        // Compare password
        console.log("Comparing passwords...");
        const match = await bcrypt.compare(password, user.password);
        console.log("Password match result:", match);
        
        if (!match) {
            console.log("Password comparison failed");
            return res.status(400).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );
        
        console.log("Login successful for user:", user.email);
        
        res.status(200).json({ 
            success: true,
            message: "Login successful",
            token, 
            user: user.profile 
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error during login",
            error: err.message 
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update user profile
exports.updateUser = async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User updated", user: updated.profile });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
    try {
        const users = await User.findByRole(req.params.role).select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Toggle user status
exports.toggleStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.status = user.status === "active" ? "inactive" : "active";
        await user.save();
        res.status(200).json({ message: "Status toggled", status: user.status });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id;
        
        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: "Current password is incorrect" 
            });
        }
        
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        
        // Update password
        await User.findByIdAndUpdate(userId, { password: hashedNewPassword });
        
        res.status(200).json({ 
            success: true, 
            message: "Password updated successfully" 
        });
    } catch (err) {
        console.error("Password change error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error during password change",
            error: err.message 
        });
    }
};

// Get current user profile (from token)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        res.status(200).json({ 
            success: true,
            user: user.profile 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Server error",
            error: err.message 
        });
    }
};

// Search users by name or email
exports.searchUsers = async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;
        
        if (!query) {
            return res.status(400).json({ 
                success: false, 
                message: "Search query is required" 
            });
        }
        
        const searchRegex = new RegExp(query, 'i');
        const skip = (page - 1) * limit;
        
        const users = await User.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        })
        .select("-password")
        .skip(skip)
        .limit(parseInt(limit));
        
        const total = await User.countDocuments({
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        });
        
        res.status(200).json({ 
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Server error",
            error: err.message 
        });
    }
};
