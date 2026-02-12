const express = require('express');
const {
  createFaq,
  listFaqs,
  listFaqCategories,
  getFaq,
  updateFaq,
  deleteFaq,
} = require('../controllers/faqsController');

const router = express.Router();

router.post('/faqs', createFaq);
router.get('/faqs', listFaqs);
router.get('/faqs/categories', listFaqCategories);
router.get('/faqs/:faq_id', getFaq);
router.patch('/faqs/:faq_id', updateFaq);
router.delete('/faqs/:faq_id', deleteFaq);

module.exports = router;
