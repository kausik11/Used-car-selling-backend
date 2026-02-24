const { verifyJWT } = require('./verifyJWT');

const protect = verifyJWT;

module.exports = {
  protect,
};
