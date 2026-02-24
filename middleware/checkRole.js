const { hasAnyRole } = require('../utils/roles');

const checkRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!hasAnyRole(req.user.role, allowedRoles)) {
    return res.status(403).json({ error: 'Forbidden: insufficient role permissions' });
  }

  return next();
};

const adminOnly = checkRole('admin');
const superadminOnly = checkRole('superadmin');
const adminOrSuperadmin = checkRole('admin', 'superadmin');

module.exports = {
  checkRole,
  adminOnly,
  superadminOnly,
  adminOrSuperadmin,
};
