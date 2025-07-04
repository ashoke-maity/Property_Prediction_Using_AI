const express = require('express');
const mongoose = require('mongoose');
const userModel = require('../models/user.Model');

const userRegister = async (req,res) => {
    try {
        console.log("User register endpoint called");
        res.json({
            status: 1,
            msg: "this is user register api"
        });
    } catch (error) {
        console.error("Error in userRegister:", error);
        res.status(500).json({
            status: 0,
            msg: "Internal server error"
        });
    }
}

const userLogin = async(req,res) => {
    try {
        console.log("User login endpoint called");
        res.json({
            status: 1,
            msg: "this is user login api"
        });
    } catch (error) {
        console.error("Error in userLogin:", error);
        res.status(500).json({
            status: 0,
            msg: "Internal server error"
        });
    }
}

module.exports = {userRegister, userLogin}