const jwt = require('jsonwebtoken');
const User = require('../models/User');

const parseBearerToken = (authorization) => {
  if (!authorization || !authorization.startsWith('Bearer ')) return null;
  return authorization.split(' ')[1];
};

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = parseBearerToken(authHeader);
    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('_id role auth_session_version');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token user' });
    }

    const tokenSessionVersion = decoded.sessionVersion || 0;
    const currentSessionVersion = user.auth_session_version || 0;
    if (tokenSessionVersion !== currentSessionVersion) {
      return res.status(401).json({ error: 'Session expired due to login on another device' });
    }

    req.user = {
      ...decoded,
      id: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = parseBearerToken(authHeader);
    if (!token) return next();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('_id role auth_session_version');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token user' });
    }

    const tokenSessionVersion = decoded.sessionVersion || 0;
    const currentSessionVersion = user.auth_session_version || 0;
    if (tokenSessionVersion !== currentSessionVersion) {
      return res.status(401).json({ error: 'Session expired due to login on another device' });
    }

    req.user = {
      ...decoded,
      id: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
};

const administratorOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Administrator access required' });
  }

  return next();
};

const adminOrAdministrator = (req, res, next) => {
  if (!req.user || !['admin', 'administrator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin or administrator access required' });
  }

  return next();
};

// Backward-compatible alias for previous misspelled export.
const adminOrAdministator = adminOrAdministrator;

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminOnly,
  administratorOnly,
  adminOrAdministrator,
  adminOrAdministator,
};
