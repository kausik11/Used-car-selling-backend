const ROLE_ALIASES = {
  user: 'user',
  normaluser: 'user',
  admin: 'admin',
  superadmin: 'superadmin',
  administrator: 'superadmin',
};

const CANONICAL_ROLES = ['user', 'admin', 'superadmin'];

const normalizeRole = (role) => {
  if (typeof role !== 'string') return null;
  return ROLE_ALIASES[role.trim().toLowerCase()] || null;
};

const resolveRoleForStorage = (role) => normalizeRole(role) || 'user';

const hasAnyRole = (role, allowedRoles = []) => {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) return false;

  const normalizedAllowedRoles = allowedRoles
    .map((item) => normalizeRole(item))
    .filter(Boolean);

  return normalizedAllowedRoles.includes(normalizedRole);
};

const isAdminLike = (role) => hasAnyRole(role, ['admin', 'superadmin']);

module.exports = {
  CANONICAL_ROLES,
  normalizeRole,
  resolveRoleForStorage,
  hasAnyRole,
  isAdminLike,
};
