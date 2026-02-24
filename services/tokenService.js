const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { resolveRoleForStorage } = require('../utils/roles');

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const REFRESH_COOKIE_MAX_AGE_MS = Number(process.env.JWT_REFRESH_COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_NAME = process.env.JWT_REFRESH_COOKIE_NAME || 'refreshToken';

const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_ACCESS_SECRET or JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }
  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_REFRESH_SECRET or JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }
  return secret;
};

const buildBasePayload = (user) => ({
  sub: user._id.toString(),
  role: resolveRoleForStorage(user.role),
  tokenVersion: user.auth_session_version || 0,
});

const createAccessToken = (user) =>
  jwt.sign(
    {
      ...buildBasePayload(user),
      type: 'access',
    },
    getAccessSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

const createRefreshToken = (user) =>
  jwt.sign(
    {
      ...buildBasePayload(user),
      type: 'refresh',
      jti: crypto.randomUUID(),
    },
    getRefreshSecret(),
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

const verifyAccessToken = (token) => jwt.verify(token, getAccessSecret());
const verifyRefreshToken = (token) => jwt.verify(token, getRefreshSecret());
const decodeToken = (token) => jwt.decode(token);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getRefreshCookieOptions = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const sameSite = process.env.JWT_REFRESH_COOKIE_SAMESITE || (isProduction ? 'none' : 'lax');

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: '/api/auth',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  };
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

module.exports = {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_COOKIE_NAME,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
