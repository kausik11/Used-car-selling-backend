const { CallbackRequest } = require('../models');

const pickString = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  return String(value);
};

const createCallbackRequest = async (req, res, next) => {
  try {
    const body = req.body || {};
    const payload = {
      fullName: pickString(body.fullName),
      phoneNumber: pickString(body.phoneNumber),
      email: pickString(body.email),
      budgetRange: pickString(body.budgetRange),
      preferredBrand: pickString(body.preferredBrand),
      description: pickString(body.description),
      status: pickString(body.status),
      adminComment: pickString(body.adminComment),
    };

    const created = await CallbackRequest.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const listCallbackRequests = async (req, res, next) => {
  try {
    const { status, email, phoneNumber, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filters = {};

    if (status) filters.status = String(status);
    if (email) filters.email = String(email).trim().toLowerCase();
    if (phoneNumber) filters.phoneNumber = String(phoneNumber).trim();

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);
    const skip = (safePage - 1) * safeLimit;

    const [total, items] = await Promise.all([
      CallbackRequest.countDocuments(filters),
      CallbackRequest.find(filters).sort(sort).skip(skip).limit(safeLimit),
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

const getCallbackRequest = async (req, res, next) => {
  try {
    const { callback_request_id } = req.params;
    const item = await CallbackRequest.findById(callback_request_id);
    if (!item) return res.status(404).json({ error: 'Callback request not found' });
    return res.json(item);
  } catch (err) {
    return next(err);
  }
};

const updateCallbackRequest = async (req, res, next) => {
  try {
    const { callback_request_id } = req.params;
    const body = req.body || {};
    const updates = {};

    if (body.fullName !== undefined) updates.fullName = pickString(body.fullName);
    if (body.phoneNumber !== undefined) updates.phoneNumber = pickString(body.phoneNumber);
    if (body.email !== undefined) updates.email = pickString(body.email);
    if (body.budgetRange !== undefined) updates.budgetRange = pickString(body.budgetRange);
    if (body.preferredBrand !== undefined) updates.preferredBrand = pickString(body.preferredBrand);
    if (body.description !== undefined) updates.description = pickString(body.description);
    if (body.status !== undefined) updates.status = pickString(body.status);
    if (body.adminComment !== undefined) updates.adminComment = pickString(body.adminComment);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updated = await CallbackRequest.findByIdAndUpdate(
      callback_request_id,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updated) return res.status(404).json({ error: 'Callback request not found' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

const deleteCallbackRequest = async (req, res, next) => {
  try {
    const { callback_request_id } = req.params;
    const deleted = await CallbackRequest.findByIdAndDelete(callback_request_id);
    if (!deleted) return res.status(404).json({ error: 'Callback request not found' });
    return res.json({
      message: 'Callback request deleted successfully',
      callback_request_id: deleted._id,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createCallbackRequest,
  listCallbackRequests,
  getCallbackRequest,
  updateCallbackRequest,
  deleteCallbackRequest,
};
