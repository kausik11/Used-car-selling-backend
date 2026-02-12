const express = require('express');
const {
  createReview,
  listReviews,
  getReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController');

const router = express.Router();

router.post('/reviews', createReview);
router.get('/reviews', listReviews);
router.get('/reviews/:review_id', getReview);
router.patch('/reviews/:review_id', updateReview);
router.delete('/reviews/:review_id', deleteReview);

module.exports = router;
