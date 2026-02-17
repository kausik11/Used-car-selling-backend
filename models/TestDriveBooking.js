const mongoose = require('mongoose');

const FIXED_HUB_LOCATION = '30/A, Dumdum, Station Road';
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

const TestDriveBookingSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true, match: /^[0-9]{10}$/ },

    hub_location: {
      type: String,
      required: true,
      enum: [FIXED_HUB_LOCATION],
      trim: true,
      immutable: true,
      index: true,
    },

    date: { type: Date, required: true, index: true },

    time_slot: { type: String, required: true, enum: TEST_DRIVE_SLOTS },

    status: {
      type: String,
      enum: ['booked', 'cancelled', 'completed'],
      default: 'booked',
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

TestDriveBookingSchema.index(
  { car_id: 1, date: 1, time_slot: 1 },
  { unique: true, name: 'uniq_test_drive_slot' }
);

module.exports = mongoose.model('TestDriveBooking', TestDriveBookingSchema);
