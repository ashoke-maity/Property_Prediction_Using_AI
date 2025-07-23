const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const corsOptions = require('./middlewares/cors.Middleware');
const app = express();

// database connection
const connectDB = require('./configs/db');
connectDB();

// router calls
const userRouter = require('./routes/user.Route');
const predictionRouter = require('./routes/prediction.Route');
const propertyRouter = require('./routes/property.Route');

// middleware
app.use(express.json());
app.use(cors(corsOptions));

// user api routes
app.use(process.env.USER_API_KEY, userRouter);
app.use(process.env.USER_API_KEY, predictionRouter);
app.use(process.env.USER_API_KEY, propertyRouter);

// server start
const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
    console.log(`server started in PORT: ${PORT}`);
});