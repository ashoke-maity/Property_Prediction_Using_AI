const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    unique: true,
    require: true,
  },
  Password: {
    type: String,
    required: true,
  },
});

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
