const jwt = require('jsonwebtoken');
const userModel = require('../models/user.Model');

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id, 
            email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Verify JWT token middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database
        const user = await userModel.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid, user not found'
            });
        }

        // Add user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during token verification'
        });
    }
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

        if (!token) {
            req.user = null;
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database
        const user = await userModel.findById(decoded.userId).select('-password');
        
        req.user = user || null;
        next();

    } catch (error) {
        console.error('Optional auth error:', error);
        req.user = null;
        next();
    }
};

/**
 * Format user data for response (remove sensitive information)
 * @param {Object} user - User object from database
 * @returns {Object} - Formatted user data
 */
const formatUserResponse = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };
};

module.exports = {
    generateToken,
    verifyToken,
    optionalAuth,
    formatUserResponse
};