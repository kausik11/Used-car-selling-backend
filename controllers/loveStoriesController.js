const { LoveStory } = require('../models');
const { cloudinary } = require('../config/cloudinary');

const uploadImage = async (file) => {
  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const uploadResult = await cloudinary.uploader.upload(base64Image, {
    folder: 'singhbackend/love-stories',
    resource_type: 'auto',
  });

  return {
    imageUrl: uploadResult.secure_url,
    imagePublicId: uploadResult.public_id,
  };
};

const createLoveStory = async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'image file is required' });
    }

    const { imageUrl, imagePublicId } = await uploadImage(req.file);

    const created = await LoveStory.create({
      image: imageUrl,
      imagePublicId,
      title,
      description,
    });
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
    const story = await LoveStory.findById(story_id);
    if (!story) return res.status(404).json({ error: 'Love story not found' });

    let changed = false;

    if (req.body?.title !== undefined) {
      story.title = req.body.title;
      changed = true;
    }
    if (req.body?.description !== undefined) {
      story.description = req.body.description;
      changed = true;
    }

    if (req.file) {
      const { imageUrl, imagePublicId } = await uploadImage(req.file);
      if (story.imagePublicId) {
        await cloudinary.uploader.destroy(story.imagePublicId);
      }
      story.image = imageUrl;
      story.imagePublicId = imagePublicId;
      changed = true;
    }

    if (!changed) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    await story.save();

    return res.json(story);
  } catch (err) {
    return next(err);
  }
};

const deleteLoveStory = async (req, res, next) => {
  try {
    const { story_id } = req.params;
    const story = await LoveStory.findById(story_id);
    if (!story) return res.status(404).json({ error: 'Love story not found' });

    if (story.imagePublicId) {
      await cloudinary.uploader.destroy(story.imagePublicId);
    }

    await story.deleteOne();
    return res.json({ message: 'Love story deleted successfully', story_id: story._id });
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
