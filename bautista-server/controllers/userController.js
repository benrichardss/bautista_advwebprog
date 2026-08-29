const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HttpStatus } = require("../config/constants");

// Register new user
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, contactNumber, address, role } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Check password match
        if (password !== confirmPassword) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            contactNumber,
            address,
            role: role || "buyer"
        });

        const savedUser = await user.save();

        // Create JWT token
        const token = jwt.sign(
            { id: savedUser._id, email: savedUser.email },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: savedUser._id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                role: savedUser.role
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
        }

        /*if (user.type === 'buyer') {
            return res.status(403).json({ message: 'Buyer accounts cannot proceed to this page.' });
        }*/

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                contactNumber: user.contactNumber,
                address: user.address
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, contactNumber, address, role, isActive, password } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "User not found"
            });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) {
            user.email = email.toLowerCase();
        }
        if (contactNumber) user.contactNumber = contactNumber;
        if (address) user.address = address;
        if (role && (role === "buyer" || role === "seller" || role === "admin")) {
            user.role = role;
        }
        if (typeof isActive === "boolean") {
            user.isActive = isActive;
        }
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await user.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
                contactNumber: updatedUser.contactNumber,
                address: updatedUser.address,
                isActive: updatedUser.isActive
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "New passwords do not match"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter)
            .select("-password")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.status(HttpStatus.OK).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};
