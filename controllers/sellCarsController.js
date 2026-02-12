const { SellCar } = require('../models');

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const toBoolean = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return value;
};

const pickString = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  return String(value);
};

const fileUrl = (files, fieldName) => {
  const file = files?.[fieldName]?.[0];
  return file?.path || file?.secure_url;
};

const createSellCar = async (req, res, next) => {
  try {
    const body = req.body || {};
    const files = req.files || {};

    const images = {
      front: fileUrl(files, 'front'),
      back: fileUrl(files, 'back'),
      interior: fileUrl(files, 'interior'),
      odometer: fileUrl(files, 'odometer'),
    };

    const missingImageFields = Object.entries(images)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    if (missingImageFields.length > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Cloudinary image uploads are required for front, back, interior and odometer',
        fields: missingImageFields,
      });
    }

    const payload = {
      brand: pickString(body.brand),
      model: pickString(body.model),
      variant: pickString(body.variant),
      year: toNumber(body.year),
      fuelType: pickString(body.fuelType),
      transmission: pickString(body.transmission),
      kmDriven: toNumber(body.kmDriven),
      owner: pickString(body.owner),
      city: pickString(body.city),
      state: pickString(body.state),
      condition: pickString(body.condition),
      accidentHistory: toBoolean(body.accidentHistory),
      expectedPrice: toNumber(body.expectedPrice),
      negotiable: toBoolean(body.negotiable),
      images,
      seller: {
        fullName: pickString(body['seller.fullName'] ?? body?.seller?.fullName),
        email: pickString(body['seller.email'] ?? body?.seller?.email),
        phoneNumber: pickString(body['seller.phoneNumber'] ?? body?.seller?.phoneNumber),
        phoneVerified: toBoolean(body['seller.phoneVerified'] ?? body?.seller?.phoneVerified),
      },
      status: pickString(body.status),
      adminStatement: pickString(body.adminStatement),
    };

    if (!payload.seller.fullName && body.fullName) payload.seller.fullName = pickString(body.fullName);
    if (!payload.seller.phoneNumber && body.phoneNumber) payload.seller.phoneNumber = pickString(body.phoneNumber);

    const created = await SellCar.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const listSellCars = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);
    const skip = (safePage - 1) * safeLimit;

    const [total, items] = await Promise.all([
      SellCar.countDocuments({}),
      SellCar.find({}).sort(sort).skip(skip).limit(safeLimit),
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

const getSellCar = async (req, res, next) => {
  try {
    const { sell_car_id } = req.params;
    const item = await SellCar.findById(sell_car_id);
    if (!item) return res.status(404).json({ error: 'Sell car record not found' });
    return res.json(item);
  } catch (err) {
    return next(err);
  }
};

const updateSellCar = async (req, res, next) => {
  try {
    const { sell_car_id } = req.params;
    const body = req.body || {};
    const files = req.files || {};
    const updates = {};

    if (body.brand !== undefined) updates.brand = pickString(body.brand);
    if (body.model !== undefined) updates.model = pickString(body.model);
    if (body.variant !== undefined) updates.variant = pickString(body.variant);
    if (body.year !== undefined) updates.year = toNumber(body.year);
    if (body.fuelType !== undefined) updates.fuelType = pickString(body.fuelType);
    if (body.transmission !== undefined) updates.transmission = pickString(body.transmission);
    if (body.kmDriven !== undefined) updates.kmDriven = toNumber(body.kmDriven);
    if (body.owner !== undefined) updates.owner = pickString(body.owner);
    if (body.city !== undefined) updates.city = pickString(body.city);
    if (body.state !== undefined) updates.state = pickString(body.state);
    if (body.condition !== undefined) updates.condition = pickString(body.condition);
    if (body.accidentHistory !== undefined) updates.accidentHistory = toBoolean(body.accidentHistory);
    if (body.expectedPrice !== undefined) updates.expectedPrice = toNumber(body.expectedPrice);
    if (body.negotiable !== undefined) updates.negotiable = toBoolean(body.negotiable);
    if (body.status !== undefined) updates.status = pickString(body.status);
    if (body.adminStatement !== undefined) updates.adminStatement = pickString(body.adminStatement);

    if (body['seller.fullName'] !== undefined) updates['seller.fullName'] = pickString(body['seller.fullName']);
    if (body['seller.email'] !== undefined) updates['seller.email'] = pickString(body['seller.email']);
    if (body['seller.phoneNumber'] !== undefined) updates['seller.phoneNumber'] = pickString(body['seller.phoneNumber']);
    if (body['seller.phoneVerified'] !== undefined) {
      updates['seller.phoneVerified'] = toBoolean(body['seller.phoneVerified']);
    }

    const front = fileUrl(files, 'front');
    const back = fileUrl(files, 'back');
    const interior = fileUrl(files, 'interior');
    const odometer = fileUrl(files, 'odometer');
    if (front) updates['images.front'] = front;
    if (back) updates['images.back'] = back;
    if (interior) updates['images.interior'] = interior;
    if (odometer) updates['images.odometer'] = odometer;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updated = await SellCar.findByIdAndUpdate(
      sell_car_id,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    );
    if (!updated) return res.status(404).json({ error: 'Sell car record not found' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

const deleteSellCar = async (req, res, next) => {
  try {
    const { sell_car_id } = req.params;
    const deleted = await SellCar.findByIdAndDelete(sell_car_id);
    if (!deleted) return res.status(404).json({ error: 'Sell car record not found' });
    return res.json({ message: 'Sell car record deleted successfully', sell_car_id: deleted._id });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createSellCar,
  listSellCars,
  getSellCar,
  updateSellCar,
  deleteSellCar,
};
