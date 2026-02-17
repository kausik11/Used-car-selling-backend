const express = require('express');
const multer = require('multer');
const {
  createLoveStory,
  listLoveStories,
  getLoveStory,
  updateLoveStory,
  deleteLoveStory,
} = require('../controllers/loveStoriesController');
const { authMiddleware, adminOrAdministrator } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/love-stories', authMiddleware, adminOrAdministrator, upload.single('image'), createLoveStory);
router.patch('/love-stories/:story_id', authMiddleware, adminOrAdministrator, upload.single('image'), updateLoveStory);
router.delete('/love-stories/:story_id', authMiddleware, adminOrAdministrator, deleteLoveStory);
router.get('/love-stories', listLoveStories);
router.get('/love-stories/:story_id', getLoveStory);


module.exports = router;
