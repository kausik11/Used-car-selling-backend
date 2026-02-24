const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  googleLogin,
  refreshToken,
  logout,
  sendOtp,
  verifyOtp,
  me,
} = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { verifyJWT } = require('../middleware/verifyJWT');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('email').trim().isEmail().withMessage('valid email is required'),
    body('phone').trim().notEmpty().withMessage('phone is required'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
    body('city').trim().notEmpty().withMessage('city is required'),
    body('address').trim().notEmpty().withMessage('address is required'),
    body('pin').trim().notEmpty().withMessage('pin is required'),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('valid email is required'),
    body('password').notEmpty().withMessage('password is required'),
  ],
  validateRequest,
  login
);

router.post('/google', [body('idToken').notEmpty().withMessage('idToken is required')], validateRequest, googleLogin);

router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', verifyJWT, me);

router.post('/send-otp', [body('email').trim().isEmail().withMessage('valid email is required')], validateRequest, sendOtp);

router.post(
  '/verify-otp',
  [
    body('email').trim().isEmail().withMessage('valid email is required'),
    body('otp').notEmpty().withMessage('otp is required'),
  ],
  validateRequest,
  verifyOtp
);

module.exports = router;
