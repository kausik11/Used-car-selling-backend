const { Faq } = require('../models');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toExactCaseInsensitiveRegex = (value) =>
  new RegExp(`^${escapeRegex(String(value).trim())}$`, 'i');

const createFaq = async (req, res, next) => {
  try {
    const { category, question, answer, link, image } = req.body || {};
    const created = await Faq.create({ category, question, answer, link, image });
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
    const updates = {};

    if (req.body?.category !== undefined) updates.category = req.body.category;
    if (req.body?.question !== undefined) updates.question = req.body.question;
    if (req.body?.answer !== undefined) updates.answer = req.body.answer;
    if (req.body?.link !== undefined) updates.link = req.body.link;
    if (req.body?.image !== undefined) updates.image = req.body.image;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updated = await Faq.findByIdAndUpdate(
      faq_id,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    );
    if (!updated) return res.status(404).json({ error: 'FAQ not found' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

const deleteFaq = async (req, res, next) => {
  try {
    const { faq_id } = req.params;
    const deleted = await Faq.findByIdAndDelete(faq_id);
    if (!deleted) return res.status(404).json({ error: 'FAQ not found' });
    return res.json({ message: 'FAQ deleted successfully', faq_id: deleted._id });
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
