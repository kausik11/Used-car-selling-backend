const { LoveStory } = require('../models');

const createLoveStory = async (req, res, next) => {
  try {
    const { image, title, description } = req.body || {};
    const created = await LoveStory.create({ image, title, description });
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const listLoveStories = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-created_at' } = req.query;
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);
    const skip = (safePage - 1) * safeLimit;

    const [total, items] = await Promise.all([
      LoveStory.countDocuments({}),
      LoveStory.find({}).sort(sort).skip(skip).limit(safeLimit),
    ]);

    return res.json({
      page: safePage,
      limit: safeLimit,
      total,
      items,
    });
  } catch (err) {
    return next(err);
  }
};

const getLoveStory = async (req, res, next) => {
  try {
    const { story_id } = req.params;
    const story = await LoveStory.findById(story_id);
    if (!story) return res.status(404).json({ error: 'Love story not found' });
    return res.json(story);
  } catch (err) {
    return next(err);
  }
};

const updateLoveStory = async (req, res, next) => {
  try {
    const { story_id } = req.params;
    const updates = {};

    if (req.body?.image !== undefined) updates.image = req.body.image;
    if (req.body?.title !== undefined) updates.title = req.body.title;
    if (req.body?.description !== undefined) updates.description = req.body.description;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updated = await LoveStory.findByIdAndUpdate(
      story_id,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    );
    if (!updated) return res.status(404).json({ error: 'Love story not found' });

    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

const deleteLoveStory = async (req, res, next) => {
  try {
    const { story_id } = req.params;
    const deleted = await LoveStory.findByIdAndDelete(story_id);
    if (!deleted) return res.status(404).json({ error: 'Love story not found' });
    return res.json({ message: 'Love story deleted successfully', story_id: deleted._id });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createLoveStory,
  listLoveStories,
  getLoveStory,
  updateLoveStory,
  deleteLoveStory,
};
