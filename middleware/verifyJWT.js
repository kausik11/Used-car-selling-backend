const User = require('../models/User');
const { normalizeRole } = require('../utils/roles');
const { verifyAccessToken } = require('../services/tokenService');

const parseBearerToken = (authorization) => {
  if (!authorization || !authorization.startsWith('Bearer ')) return null;
  return authorization.split(' ')[1];
};

const attachUserFromToken = async (decodedToken) => {
  const userId = decodedToken.sub || decodedToken.id;
  if (!userId) return null;

  const user = await User.findById(userId).select('_id role auth_session_version');
  if (!user) return null;

  const tokenVersion =
    typeof decodedToken.tokenVersion === 'number'
      ? decodedToken.tokenVersion
      : typeof decodedToken.sessionVersion === 'number'
      ? decodedToken.sessionVersion
      : 0;

  const currentSessionVersion = user.auth_session_version || 0;
  if (tokenVersion !== currentSessionVersion) return false;

  return {
    id: user._id.toString(),
    role: normalizeRole(user.role) || 'user',
    rawRole: user.role,
    tokenVersion: currentSessionVersion,
  };
};

const verifyJWT = async (req, res, next) => {
  try {
    const token = parseBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const decoded = verifyAccessToken(token);
    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const authenticatedUser = await attachUserFromToken(decoded);
    if (authenticatedUser === null) {
      return res.status(401).json({ error: 'Invalid token user' });
    }
    if (authenticatedUser === false) {
      return res.status(401).json({ error: 'Session expired due to login on another device' });
    }

    req.user = authenticatedUser;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const optionalVerifyJWT = async (req, res, next) => {
  try {
    const token = parseBearerToken(req.headers.authorization);
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    if (decoded.type && decoded.type !== 'access') return next();

    const authenticatedUser = await attachUserFromToken(decoded);
    if (authenticatedUser === null || authenticatedUser === false) return next();

    req.user = authenticatedUser;
    return next();
  } catch (error) {
    return next();
  }
};

module.exports = {
  verifyJWT,
  optionalVerifyJWT,
};
