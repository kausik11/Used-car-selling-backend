const express = require('express');
const {
  createReview,
  listReviews,
  getReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController');
const { authMiddleware, adminOrAdministrator } = require('../middleware/auth');

const router = express.Router();

router.post('/reviews', authMiddleware, adminOrAdministrator, createReview);
router.patch('/reviews/:review_id', authMiddleware, adminOrAdministrator, updateReview);
router.delete('/reviews/:review_id', authMiddleware, adminOrAdministrator, deleteReview);
router.get('/reviews', listReviews);
router.get('/reviews/:review_id', getReview);


module.exports = router;
