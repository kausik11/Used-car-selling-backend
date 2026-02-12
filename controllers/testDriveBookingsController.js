const { CarListing, TestDriveBooking } = require('../models');

const TEST_DRIVE_SLOTS = [
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
];
const FIXED_HUB_LOCATION = '30/A, Dumdum, Station Road';

const parseDateOnly = (value) => {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

const getDateRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const validateBookingInput = ({ car_id, hub_location, date, time_slot }) => {
  if (!car_id || !hub_location || !date || !time_slot) {
    return 'car_id, hub_location, date and time_slot are required';
  }
  if (String(hub_location).trim() !== FIXED_HUB_LOCATION) {
    return `hub_location must be exactly "${FIXED_HUB_LOCATION}"`;
  }
  if (!TEST_DRIVE_SLOTS.includes(String(time_slot))) {
    return `time_slot must be one of: ${TEST_DRIVE_SLOTS.join(', ')}`;
  }
  return null;
};

const createTestDriveBooking = async (req, res, next) => {
  try {
    const { car_id, hub_location, date, time_slot } = req.body || {};
    const validationError = validateBookingInput({ car_id, hub_location, date, time_slot });
    if (validationError) return res.status(400).json({ error: validationError });

    const parsedDate = parseDateOnly(date);
    if (!parsedDate) return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return res.status(400).json({ error: 'Past date is not allowed for test drive booking' });
    }

    const carExists = await CarListing.exists({ car_id });
    if (!carExists) return res.status(404).json({ error: 'Car not found' });

    const booking = await TestDriveBooking.create({
      car_id,
      hub_location,
      date: parsedDate,
      time_slot,
    });

    return res.status(201).json(booking);
  } catch (err) {
    return next(err);
  }
};

const listTestDriveBookings = async (req, res, next) => {
  try {
    const { car_id, hub_location, date, status, page = 1, limit = 20, sort = '-created_at' } = req.query;
    const filters = {};

    if (car_id) filters.car_id = String(car_id);
    if (hub_location) {
      if (String(hub_location).trim() !== FIXED_HUB_LOCATION) {
        return res.status(400).json({
          error: `hub_location must be exactly "${FIXED_HUB_LOCATION}"`,
        });
      }
      filters.hub_location = FIXED_HUB_LOCATION;
    }
    if (status) filters.status = String(status);

    if (date) {
      const parsedDate = parseDateOnly(String(date));
      if (!parsedDate) return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
      const { start, end } = getDateRange(parsedDate);
      filters.date = { $gte: start, $lt: end };
    }

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);
    const skip = (safePage - 1) * safeLimit;

    const [total, items] = await Promise.all([
      TestDriveBooking.countDocuments(filters),
      TestDriveBooking.find(filters).sort(sort).skip(skip).limit(safeLimit),
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

const getTestDriveBookingsByCar = async (req, res, next) => {
  try {
    const { car_id } = req.params;
    const carExists = await CarListing.exists({ car_id: String(car_id) });
    if (!carExists) return res.status(404).json({ error: 'Car not found' });

    const items = await TestDriveBooking.find({ car_id: String(car_id) }).sort('-created_at');
    return res.json({ car_id: String(car_id), total: items.length, items });
  } catch (err) {
    return next(err);
  }
};

const updateTestDriveBooking = async (req, res, next) => {
  try {
    const { booking_id } = req.params;
    const updates = {};

    if (req.body?.hub_location !== undefined) {
      if (String(req.body.hub_location).trim() !== FIXED_HUB_LOCATION) {
        return res.status(400).json({
          error: `hub_location must be exactly "${FIXED_HUB_LOCATION}"`,
        });
      }
      updates.hub_location = FIXED_HUB_LOCATION;
    }
    if (req.body?.status !== undefined) updates.status = String(req.body.status);
    if (req.body?.time_slot !== undefined) {
      const slot = String(req.body.time_slot);
      if (!TEST_DRIVE_SLOTS.includes(slot)) {
        return res.status(400).json({ error: `time_slot must be one of: ${TEST_DRIVE_SLOTS.join(', ')}` });
      }
      updates.time_slot = slot;
    }
    if (req.body?.date !== undefined) {
      const parsedDate = parseDateOnly(String(req.body.date));
      if (!parsedDate) return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        return res.status(400).json({ error: 'Past date is not allowed for test drive booking' });
      }
      updates.date = parsedDate;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updated = await TestDriveBooking.findByIdAndUpdate(
      booking_id,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    );
    if (!updated) return res.status(404).json({ error: 'Test drive booking not found' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

const deleteTestDriveBooking = async (req, res, next) => {
  try {
    const { booking_id } = req.params;
    const deleted = await TestDriveBooking.findByIdAndDelete(booking_id);
    if (!deleted) return res.status(404).json({ error: 'Test drive booking not found' });
    return res.json({ message: 'Test drive booking deleted successfully', booking_id: deleted._id });
  } catch (err) {
    return next(err);
  }
};

const getTestDriveSlots = async (req, res, next) => {
  try {
    const { car_id, hub_location, date } = req.query;
    if (!car_id || !hub_location || !date) {
      return res.status(400).json({ error: 'car_id, hub_location and date are required' });
    }
    if (String(hub_location).trim() !== FIXED_HUB_LOCATION) {
      return res.status(400).json({
        error: `hub_location must be exactly "${FIXED_HUB_LOCATION}"`,
      });
    }

    const parsedDate = parseDateOnly(String(date));
    if (!parsedDate) return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return res.status(400).json({ error: 'Past date is not allowed for test drive booking' });
    }

    const carExists = await CarListing.exists({ car_id: String(car_id) });
    if (!carExists) return res.status(404).json({ error: 'Car not found' });

    const { start, end } = getDateRange(parsedDate);
    const bookings = await TestDriveBooking.find({
      car_id: String(car_id),
      hub_location: FIXED_HUB_LOCATION,
      date: { $gte: start, $lt: end },
      status: 'booked',
    }).lean();

    const bookedSlots = new Set(bookings.map((item) => item.time_slot));
    const slots = TEST_DRIVE_SLOTS.map((slot) => ({
      time_slot: slot,
      available: !bookedSlots.has(slot),
    }));

    return res.json({
      car_id: String(car_id),
      hub_location: FIXED_HUB_LOCATION,
      date: String(date),
      slots,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createTestDriveBooking,
  listTestDriveBookings,
  getTestDriveBookingsByCar,
  updateTestDriveBooking,
  deleteTestDriveBooking,
  getTestDriveSlots,
  TEST_DRIVE_SLOTS,
};
