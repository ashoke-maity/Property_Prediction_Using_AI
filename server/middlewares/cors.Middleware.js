// cors file
const dotenv = require('dotenv').config();
const cors = require('cors');
var corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true
}

module.exports=corsOptions;