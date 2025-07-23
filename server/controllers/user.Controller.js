const express = require('express');
const mongoose = require('mongoose');
const userModel = require('../models/user.Model');
const { generateToken, formatUserResponse } = require('../middlewares/userAuth.Middleware');

/**
 * @desc    Register a new user
 * @route   POST /api/register
 * @access  Public
 */
const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new userModel({
            name,
            email: email.toLowerCase(),
            password
        });

        await user.save();

        // Generate JWT token using middleware
        const token = generateToken(user);

        // Format user data using middleware
        const userData = formatUserResponse(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userData,
            token
        });

    } catch (error) {
        console.error("Error in userRegister:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/login
 * @access  Public
 */
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token using middleware
        const token = generateToken(user);

        // Format user data using middleware
        const userData = formatUserResponse(user);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userData,
            token
        });

    } catch (error) {
        console.error("Error in userLogin:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * @desc    Get user profile (protected route)
 * @route   GET /api/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
    try {
        // User is already attached to req by verifyToken middleware
        const userData = formatUserResponse(req.user);

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            user: userData
        });

    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = { userRegister, userLogin, getUserProfile };