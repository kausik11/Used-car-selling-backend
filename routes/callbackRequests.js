const express = require('express');
const {
  createCallbackRequest,
  listCallbackRequests,
  getCallbackRequest,
  updateCallbackRequest,
  deleteCallbackRequest,
} = require('../controllers/callbackRequestsController');
const { authMiddleware, adminOrAdministrator } = require('../middleware/auth');

const router = express.Router();

router.post('/callback-requests', authMiddleware, createCallbackRequest);

// only admin and Administartor have access
router.get('/callback-requests', authMiddleware, adminOrAdministrator, listCallbackRequests);
router.get(
  '/callback-requests/:callback_request_id',
  authMiddleware,
  adminOrAdministrator,
  getCallbackRequest
);
router.patch(
  '/callback-requests/:callback_request_id',
  authMiddleware,
  adminOrAdministrator,
  updateCallbackRequest
);
router.delete(
  '/callback-requests/:callback_request_id',
  authMiddleware,
  adminOrAdministrator,
  deleteCallbackRequest
);

module.exports = router;
