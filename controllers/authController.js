const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { resolveRoleForStorage } = require('../utils/roles');
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  decodeToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
} = require('../services/tokenService');

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const VALID_GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];
const GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const googleOAuthClient = GOOGLE_CLIENT_IDS.length > 0 ? new OAuth2Client(GOOGLE_CLIENT_IDS[0]) : null;

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || null,
  role: resolveRoleForStorage(user.role),
  provider: user.provider,
  googleId: user.googleId || null,
  avatar: user.avatar || null,
  isVerified: Boolean(user.isVerified || user.is_email_verified),
  is_email_verified: Boolean(user.is_email_verified),
  is_phone_verified: Boolean(user.is_phone_verified),
  city: user.city || null,
  address: user.address || null,
  pin: user.pin || null,
  lastLogin: user.lastLogin || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

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

const persistSession = async (user, res, options = {}) => {
  const shouldRotateSession = options.rotateSession !== false;

  if (shouldRotateSession) {
    user.auth_session_version = (user.auth_session_version || 0) + 1;
  }

  user.lastLogin = new Date();
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  setRefreshTokenCookie(res, refreshToken);

  return accessToken;
};

const verifyGoogleTokenPayload = async (idToken) => {
  if (!googleOAuthClient || GOOGLE_CLIENT_IDS.length === 0) {
    const error = new Error('Google OAuth client is not configured');
    error.statusCode = 500;
    throw error;
  }

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_IDS,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    const error = new Error('Invalid Google token payload');
    error.statusCode = 401;
    throw error;
  }

  if (!payload.email_verified) {
    const error = new Error('Google account email is not verified');
    error.statusCode = 401;
    throw error;
  }

  if (!VALID_GOOGLE_ISSUERS.includes(payload.iss)) {
    const error = new Error('Invalid Google token issuer');
    error.statusCode = 401;
    throw error;
  }

  return payload;
};

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, city, address, pin } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !phone || !password || !city || !address || !pin) {
      return res.status(400).json({
        error: 'name, email, phone, password, city, address and pin are required',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone }],
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or phone already exists' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      city,
      address,
      pin,
      role: 'user',
      provider: 'local',
      isVerified: false,
      is_email_verified: false,
      is_phone_verified: false,
    });

    const accessToken = await persistSession(user, res);
    return res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      token: accessToken,
      user: sanitizeUser(user),
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

    const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshTokenHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({ error: 'This account uses Google login' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = await persistSession(user, res);
    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      token: accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const payload = await verifyGoogleTokenPayload(idToken);
    const normalizedEmail = normalizeEmail(payload.email);
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: normalizedEmail }],
    }).select('+refreshTokenHash');

    if (!user) {
      user = await User.create({
        name: payload.name || 'Google User',
        email: normalizedEmail,
        googleId: payload.sub,
        avatar: payload.picture || null,
        provider: 'google',
        role: 'user',
        isVerified: true,
        is_email_verified: true,
        city: null,
        address: null,
        pin: null,
      });
    } else {
      user.googleId = user.googleId || payload.sub;
      user.avatar = payload.picture || user.avatar;
      user.isVerified = true;
      user.is_email_verified = true;
      if (!user.provider || user.provider === 'google') {
        user.provider = 'google';
      }
    }

    const accessToken = await persistSession(user, res);
    return res.status(200).json({
      message: 'Google login successful',
      accessToken,
      token: accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!incomingRefreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    let decodedRefreshToken;
    try {
      decodedRefreshToken = verifyRefreshToken(incomingRefreshToken);
      if (decodedRefreshToken.type && decodedRefreshToken.type !== 'refresh') {
        return res.status(401).json({ error: 'Invalid token type' });
      }
    } catch (error) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decodedRefreshToken.sub).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Refresh session not found' });
    }

    const currentSessionVersion = user.auth_session_version || 0;
    if ((decodedRefreshToken.tokenVersion || 0) !== currentSessionVersion) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Refresh session expired' });
    }

    const incomingRefreshTokenHash = hashToken(incomingRefreshToken);
    if (incomingRefreshTokenHash !== user.refreshTokenHash) {
      user.auth_session_version = currentSessionVersion + 1;
      user.refreshTokenHash = null;
      await user.save();

      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Refresh token reuse detected' });
    }

    const accessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();
    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken,
      token: accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (incomingRefreshToken) {
      const decoded = decodeToken(incomingRefreshToken);
      if (decoded && decoded.sub) {
        const user = await User.findById(decoded.sub).select('+refreshTokenHash');
        if (user) {
          const incomingRefreshTokenHash = hashToken(incomingRefreshToken);
          if (user.refreshTokenHash === incomingRefreshTokenHash) {
            user.refreshTokenHash = null;
            user.auth_session_version = (user.auth_session_version || 0) + 1;
            await user.save();
          }
        }
      }
    }

    clearRefreshTokenCookie(res);
    return res.status(200).json({ message: 'Logged out successfully' });
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
Singh Group
Ref: SG-OTP-V2`,
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
          <p style="margin: 8px 0 0; color: #6b7280; font-size: 12px;">Ref: SG-OTP-V2</p>
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

    const user = await User.findOne({ email: normalizedEmail }).select('+refreshTokenHash');
    if (!user) {
      return res.status(400).json({
        error: 'User profile not found. Please register with city, address and pin first.',
      });
    }

    user.is_email_verified = true;
    user.isVerified = true;

    const accessToken = await persistSession(user, res);
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      message: 'OTP verified successfully',
      accessToken,
      token: accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    return next(error);
  }
};

const getProfile = me;

module.exports = {
  register,
  login,
  googleLogin,
  refreshToken,
  logout,
  sendOtp,
  verifyOtp,
  me,
  getProfile,
};
