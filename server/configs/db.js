const dotenv = require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use Atlas if MONGO_URI exists, otherwise use local
    const uri = process.env.MONGO_URI || process.env.MONGO_LOCAL;
    
    if (!uri) {
      throw new Error('No database URI found. Set MONGO_URI or MONGO_LOCAL in .env file');
    }

    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
