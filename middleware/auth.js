const { verifyJWT, optionalVerifyJWT } = require('./verifyJWT');
const {
  checkRole,
  adminOnly,
  superadminOnly,
  adminOrSuperadmin,
} = require('./checkRole');

const administratorOnly = superadminOnly;
const adminOrAdministrator = adminOrSuperadmin;
// Backward-compatible alias for previous misspelled export.
const adminOrAdministator = adminOrAdministrator;

module.exports = {
  verifyJWT,
  checkRole,
  authMiddleware: verifyJWT,
  optionalAuthMiddleware: optionalVerifyJWT,
  adminOnly,
  superadminOnly,
  administratorOnly,
  adminOrSuperadmin,
  adminOrAdministrator,
  adminOrAdministator,
};
