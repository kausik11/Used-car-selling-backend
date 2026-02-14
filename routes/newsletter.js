const express = require('express');
const {
  createSubscription,
  listSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/newsletterController');
const { authMiddleware, adminOrAdministrator } = require('../middleware/auth');

const router = express.Router();

router.post('/', createSubscription);
router.get('/', authMiddleware, adminOrAdministrator, listSubscriptions);
router.get('/:id', authMiddleware, adminOrAdministrator, getSubscription);
router.put('/:id', authMiddleware, adminOrAdministrator, updateSubscription);
router.delete('/:id', authMiddleware, adminOrAdministrator, deleteSubscription);

module.exports = router;
