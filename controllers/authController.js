const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Otp = require('../models/Otp');

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

  if (!jwtSecret) {
    const error = new Error('JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      sessionVersion: user.auth_session_version || 0,
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
    }
  );
};

const getTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    const error = new Error('GMAIL_USER or GMAIL_PASS is not configured');
    error.statusCode = 500;
    throw error;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
};

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const ALLOWED_ROLES = ['normaluser', 'admin', 'administrator'];

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !phone || !password) {
      return res.status(400).json({
        error: 'name, email, phone and password are required',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone }],
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or phone already exists' });
    }

    const userRole = ALLOWED_ROLES.includes(role) ? role : 'normaluser';

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      role: userRole,
      is_email_verified: false,
      is_phone_verified: false,
    });

    const token = generateToken(user);
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: user.is_email_verified,
        is_phone_verified: user.is_phone_verified,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        error: 'email and password are required',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Rotate session version so previous tokens are invalidated.
    user.auth_session_version = (user.auth_session_version || 0) + 1;
    await user.save();

    const token = generateToken(user);
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: user.is_email_verified,
        is_phone_verified: user.is_phone_verified,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'email is required' });
    }

    // 6-digit numeric OTP
    const rawOtp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp: hashedOtp, expiresAt, attempts: 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Singh Group" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Singh Group - Your Login OTP Code',
      text: `Hello,

Your One-Time Password (OTP) for Singh Group login is: ${rawOtp}

This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.

If you did not request this OTP, please ignore this email. Do not share this code with anyone.

Thanks,
Singh Group`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
          <h2 style="margin: 0 0 12px; color: #111827;">Singh Group</h2>
          <p style="margin: 0 0 12px;">Hello,</p>
          <p style="margin: 0 0 12px;">Your One-Time Password (OTP) for login is:</p>
          <p style="margin: 0 0 16px; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #111827;">
            ${rawOtp}
          </p>
          <p style="margin: 0 0 12px;">This OTP is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
          <p style="margin: 0 0 12px; color: #b91c1c;">
            If you did not request this OTP, please ignore this email and do not share this code with anyone.
          </p>
          <p style="margin: 16px 0 0;">Thanks,<br/>Singh Group</p>
        </div>
      `,
    });

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    return next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ error: 'email and otp are required' });
    }

    const otpRecord = await Otp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ error: 'Maximum OTP attempts exceeded' });
    }

    const isOtpValid = await bcrypt.compare(String(otp), otpRecord.otp);
    if (!isOtpValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const generatedPassword = `otp_user_${Date.now()}`;
      user = await User.create({
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: generatedPassword,
        role: 'normaluser',
        is_email_verified: true,
        is_phone_verified: false,
      });
    } else if (!user.is_email_verified) {
      user.is_email_verified = true;
    }

    // Rotate session version so previous tokens are invalidated.
    user.auth_session_version = (user.auth_session_version || 0) + 1;
    await user.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    const token = generateToken(user);
    return res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_email_verified: user.is_email_verified,
        is_phone_verified: user.is_phone_verified,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  getProfile,
};
