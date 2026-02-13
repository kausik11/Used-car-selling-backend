const express = require('express');
const {
  createFaq,
  listFaqs,
  listFaqCategories,
  getFaq,
  updateFaq,
  deleteFaq,
} = require('../controllers/faqsController');
const { authMiddleware, adminOrAdministrator } = require('../middleware/auth');

const router = express.Router();

router.post('/faqs', authMiddleware, adminOrAdministrator, createFaq);
router.patch('/faqs/:faq_id', authMiddleware, adminOrAdministrator, updateFaq);
router.delete('/faqs/:faq_id', authMiddleware, adminOrAdministrator, deleteFaq);
router.get('/faqs', listFaqs);
router.get('/faqs/categories', listFaqCategories);
router.get('/faqs/:faq_id', getFaq);


module.exports = router;
