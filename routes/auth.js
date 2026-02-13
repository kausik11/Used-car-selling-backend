const express = require('express');
const { register, login, sendOtp, verifyOtp } = require('../controllers/authController');

const router = express.Router();

// Register new user
router.post('/register', register);

// Login existing user
router.post('/login', login);

// Send email OTP
router.post('/send-otp', sendOtp);

// Verify email OTP
router.post('/verify-otp', verifyOtp);

module.exports = router;
