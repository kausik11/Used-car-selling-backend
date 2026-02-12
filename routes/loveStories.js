const express = require('express');
const {
  createLoveStory,
  listLoveStories,
  getLoveStory,
  updateLoveStory,
  deleteLoveStory,
} = require('../controllers/loveStoriesController');

const router = express.Router();

router.post('/love-stories', createLoveStory);
router.get('/love-stories', listLoveStories);
router.get('/love-stories/:story_id', getLoveStory);
router.patch('/love-stories/:story_id', updateLoveStory);
router.delete('/love-stories/:story_id', deleteLoveStory);

module.exports = router;
