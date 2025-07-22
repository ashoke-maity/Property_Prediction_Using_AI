// cors file
const dotenv = require('dotenv').config();
const cors = require('cors');
var corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
  credentials: true
}

module.exports=corsOptions;