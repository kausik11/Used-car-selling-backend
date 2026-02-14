const Newsletter = require('../models/Newsletter');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const createSubscription = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const existing = await Newsletter.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email already subscribed' });
    }

    const subscription = await Newsletter.create({ email: normalizedEmail });
    return res.status(201).json(subscription);
  } catch (error) {
    return next(error);
  }
};

const listSubscriptions = async (_req, res, next) => {
  try {
    const subscriptions = await Newsletter.find().sort({ createdAt: -1 });
    return res.status(200).json(subscriptions);
  } catch (error) {
    return next(error);
  }
};

const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Newsletter.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    return res.status(200).json(subscription);
  } catch (error) {
    return next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const existing = await Newsletter.findOne({ email: normalizedEmail, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(409).json({ message: 'Email already subscribed' });
    }

    const subscription = await Newsletter.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.email = normalizedEmail;
    await subscription.save();

    return res.status(200).json(subscription);
  } catch (error) {
    return next(error);
  }
};

const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Newsletter.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await subscription.deleteOne();
    return res.status(200).json({ message: 'Subscription deleted' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createSubscription,
  listSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,
};
