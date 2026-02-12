const { Review } = require('../models');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseRating = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  const matched = String(value).match(/\d+/);
  return matched ? Number(matched[0]) : Number.NaN;
};

const createReview = async (req, res, next) => {
  try {
    const { reviewer_name, review_date, city, review_text, rating } = req.body || {};
    const parsedRating = parseRating(rating);

    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const created = await Review.create({
      reviewer_name,
      review_date,
      city,
      review_text,
      rating: parsedRating,
    });

    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const listReviews = async (req, res, next) => {
  try {
    const { city, rating, page = 1, limit = 20, sort = '-review_date' } = req.query;

    const filters = {};
    if (city) filters.city = new RegExp(`^${escapeRegex(String(city).trim())}$`, 'i');
    if (rating !== undefined) {
      const parsedRating = parseRating(rating);
      if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ error: 'rating must be between 1 and 5' });
      }
      filters.rating = parsedRating;
    }

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);
    const skip = (safePage - 1) * safeLimit;

    const [total, items] = await Promise.all([
      Review.countDocuments(filters),
      Review.find(filters).sort(sort).skip(skip).limit(safeLimit),
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

const getReview = async (req, res, next) => {
  try {
    const { review_id } = req.params;
    const review = await Review.findById(review_id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    return res.json(review);
  } catch (err) {
    return next(err);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { review_id } = req.params;
    const updates = {};

    if (req.body?.reviewer_name !== undefined) updates.reviewer_name = req.body.reviewer_name;
    if (req.body?.review_date !== undefined) updates.review_date = req.body.review_date;
    if (req.body?.city !== undefined) updates.city = req.body.city;
    if (req.body?.review_text !== undefined) updates.review_text = req.body.review_text;

    if (req.body?.rating !== undefined) {
      const parsedRating = parseRating(req.body.rating);
      if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ error: 'rating must be between 1 and 5' });
      }
      updates.rating = parsedRating;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updated = await Review.findByIdAndUpdate(review_id, { $set: updates }, { new: true, runValidators: true, context: 'query' });
    if (!updated) return res.status(404).json({ error: 'Review not found' });

    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { review_id } = req.params;
    const deleted = await Review.findByIdAndDelete(review_id);
    if (!deleted) return res.status(404).json({ error: 'Review not found' });
    return res.json({ message: 'Review deleted successfully', review_id: deleted._id });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createReview,
  listReviews,
  getReview,
  updateReview,
  deleteReview,
};
