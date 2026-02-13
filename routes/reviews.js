const express = require('express');
const {
  createReview,
  listReviews,
  getReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/reviews', authMiddleware, createReview);
router.patch('/reviews/:review_id', authMiddleware, updateReview);
router.delete('/reviews/:review_id', authMiddleware, deleteReview);
router.get('/reviews', listReviews);
router.get('/reviews/:review_id', getReview);


module.exports = router;
