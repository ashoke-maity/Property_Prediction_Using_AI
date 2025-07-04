const dotenv = require('dotenv').config();
const express = require('express');
const app = express();

// database connection
const dbConnect = require('./configs/db');
const mydb = dbConnect();

// router calls
const userRouter = require('./routes/user.Route');

// middleware
app.use(express.json());

// user api routes
app.use(process.env.USER_API_KEY, userRouter);

// server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server started in PORT: ${PORT}`);
});