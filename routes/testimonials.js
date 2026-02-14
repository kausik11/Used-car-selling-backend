const express = require('express');
const multer = require('multer');
const {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialsController');
const { authMiddleware, adminOrAdministrator } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getTestimonials);
router.get('/:id', getTestimonialById);
// only adnmin and Administartor have access to the below endpoints
router.post('/', authMiddleware, adminOrAdministrator, upload.single('image'), createTestimonial);
router.put('/:id', authMiddleware, adminOrAdministrator, upload.single('image'), updateTestimonial);
router.delete('/:id', authMiddleware, adminOrAdministrator, deleteTestimonial);

module.exports = router;
