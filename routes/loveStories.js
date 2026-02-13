const express = require('express');
const {
  createLoveStory,
  listLoveStories,
  getLoveStory,
  updateLoveStory,
  deleteLoveStory,
} = require('../controllers/loveStoriesController');
const { authMiddleware, adminOrAdministrator } = require('../middleware/auth');

const router = express.Router();

router.post('/love-stories', authMiddleware, adminOrAdministrator, createLoveStory);
router.patch('/love-stories/:story_id', authMiddleware, adminOrAdministrator, updateLoveStory);
router.delete('/love-stories/:story_id', authMiddleware, adminOrAdministrator, deleteLoveStory);
router.get('/love-stories', listLoveStories);
router.get('/love-stories/:story_id', getLoveStory);


module.exports = router;
