const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dbConnect = async() => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected !");
}

module.exports = dbConnect;