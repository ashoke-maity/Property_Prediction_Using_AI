const dotenv = require('dotenv').config();
const express = require('express');
const app = express();

// database connection
const dbConnect = require('./configs/db');
const mydb = dbConnect();

// router calls
const userRouter = require('./routes/user.Route');
const predictionRouter = require('./routes/prediction.Route');

// middleware
app.use(express.json());

// user api routes
app.use(process.env.USER_API_KEY, userRouter);
app.use(process.env.USER_API_KEY, predictionRouter);

// server start
const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
    console.log(`server started in PORT: ${PORT}`);
});