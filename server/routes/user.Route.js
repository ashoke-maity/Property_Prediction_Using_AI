const express = require('express');
const router = express.Router();
const { userRegister, userLogin, getUserProfile } = require('../controllers/user.Controller');
const { verifyToken } = require('../middlewares/userAuth.Middleware');

// Public routes
router.post("/register", userRegister);
router.post("/login", userLogin);

// Protected routes (require authentication)
router.get("/profile", verifyToken, getUserProfile);

module.exports = router;