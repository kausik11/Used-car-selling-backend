const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

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
  adminOnly,
  administratorOnly,
  adminOrAdministrator,
  adminOrAdministator,
};
