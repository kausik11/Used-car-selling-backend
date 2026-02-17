const { Faq } = require('../models');
const { cloudinary } = require('../config/cloudinary');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toExactCaseInsensitiveRegex = (value) =>
  new RegExp(`^${escapeRegex(String(value).trim())}$`, 'i');

const uploadImage = async (file) => {
  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const uploadResult = await cloudinary.uploader.upload(base64Image, {
    folder: 'singhbackend/faqs',
    resource_type: 'auto',
  });

  return {
    imageUrl: uploadResult.secure_url,
    imagePublicId: uploadResult.public_id,
  };
};

const createFaq = async (req, res, next) => {
  try {
    const { category, question, answer, link } = req.body || {};
    let image;
    let imagePublicId;

    if (req.file) {
      const uploadResult = await uploadImage(req.file);
      image = uploadResult.imageUrl;
      imagePublicId = uploadResult.imagePublicId;
    }

    const created = await Faq.create({ category, question, answer, link, image, imagePublicId });
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const listFaqs = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20, sort = '-created_at' } = req.query;
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);
    const skip = (safePage - 1) * safeLimit;
    const filters = {};

    if (typeof category === 'string' && category.trim()) {
      const categories = category
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (categories.length === 1) {
        filters.category = toExactCaseInsensitiveRegex(categories[0]);
      } else if (categories.length > 1) {
        filters.category = { $in: categories.map((item) => toExactCaseInsensitiveRegex(item)) };
      }
    }

    const [total, items] = await Promise.all([
      Faq.countDocuments(filters),
      Faq.find(filters).sort(sort).skip(skip).limit(safeLimit),
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

const getFaq = async (req, res, next) => {
  try {
    const { faq_id } = req.params;
    const faq = await Faq.findById(faq_id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    return res.json(faq);
  } catch (err) {
    return next(err);
  }
};

const updateFaq = async (req, res, next) => {
  try {
    const { faq_id } = req.params;
    const faq = await Faq.findById(faq_id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });

    let changed = false;

    if (req.body?.category !== undefined) {
      faq.category = req.body.category;
      changed = true;
    }
    if (req.body?.question !== undefined) {
      faq.question = req.body.question;
      changed = true;
    }
    if (req.body?.answer !== undefined) {
      faq.answer = req.body.answer;
      changed = true;
    }
    if (req.body?.link !== undefined) {
      faq.link = req.body.link;
      changed = true;
    }

    if (req.file) {
      const uploadResult = await uploadImage(req.file);
      if (faq.imagePublicId) {
        await cloudinary.uploader.destroy(faq.imagePublicId);
      }
      faq.image = uploadResult.imageUrl;
      faq.imagePublicId = uploadResult.imagePublicId;
      changed = true;
    }

    if (!changed) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    await faq.save();
    return res.json(faq);
  } catch (err) {
    return next(err);
  }
};

const deleteFaq = async (req, res, next) => {
  try {
    const { faq_id } = req.params;
    const faq = await Faq.findById(faq_id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });

    if (faq.imagePublicId) {
      await cloudinary.uploader.destroy(faq.imagePublicId);
    }

    await faq.deleteOne();
    return res.json({ message: 'FAQ deleted successfully', faq_id: faq._id });
  } catch (err) {
    return next(err);
  }
};

const listFaqCategories = async (req, res, next) => {
  try {
    const categories = await Faq.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { category: 1 } },
    ]);
    return res.json({ items: categories });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createFaq,
  listFaqs,
  listFaqCategories,
  getFaq,
  updateFaq,
  deleteFaq,
};
