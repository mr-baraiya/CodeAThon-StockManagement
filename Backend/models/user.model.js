// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name must be at most 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    role: {
        type: String,
        enum: ['staff', 'manager', 'admin'],
        default: 'staff',
        required: true
    },
    location: {
        type: String,
        maxlength: [100, "Location can be at most 100 characters"]
    },
    phone: {
        type: String,
        match: [/^\d{10}$/, "Phone must be 10 digits"]
    },
    profileImage: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

userSchema.index({ role: 1 });
userSchema.index({ location: 1 });
userSchema.index({ email: 1 }); // Index for email queries

// Pre-save middleware to hash password if modified
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('profile').get(function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        location: this.location,
        phone: this.phone,
        profileImage: this.profileImage,
        status: this.status,
        createdAt: this.createdAt,
    };
});

userSchema.statics.findByRole = function (role) {
    return this.find({ role });
};

module.exports = mongoose.model("User", userSchema);

