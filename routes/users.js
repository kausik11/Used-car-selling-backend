const express = require('express');
const {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/usersController');
const { authMiddleware, adminOrAdministrator } = require('../middleware/auth');

const router = express.Router();

// Admin panel user management routes.
router.post('/users', authMiddleware, adminOrAdministrator, createUser);
router.get('/users', authMiddleware, adminOrAdministrator, listUsers);
router.get('/users/:user_id', authMiddleware, adminOrAdministrator, getUser);
router.patch('/users/:user_id', authMiddleware, adminOrAdministrator, updateUser);
router.delete('/users/:user_id', authMiddleware, adminOrAdministrator, deleteUser);

module.exports = router;
