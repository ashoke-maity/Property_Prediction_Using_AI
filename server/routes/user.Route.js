const express = require('express');
const router = express.Router();
const {userRegister, userLogin} = require('../controllers/user.Controller');

// user login
router.get("/login", userLogin);

// user register
router.post("/register", userRegister);

module.exports = router;