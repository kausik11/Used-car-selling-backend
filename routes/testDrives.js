const express = require('express');
const {
  createTestDriveBooking,
  listTestDriveBookings,
  getTestDriveBookingsByCar,
  updateTestDriveBooking,
  deleteTestDriveBooking,
  getTestDriveSlots,
} = require('../controllers/testDriveBookingsController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/test-drives', createTestDriveBooking);
router.get('/test-drives', authMiddleware, listTestDriveBookings);
router.get('/test-drives/slots', authMiddleware, getTestDriveSlots); //no use case
router.get('/cars/:car_id/test-drives', authMiddleware, getTestDriveBookingsByCar);
router.patch('/test-drives/:booking_id', authMiddleware, updateTestDriveBooking);
router.delete('/test-drives/:booking_id', authMiddleware, deleteTestDriveBooking);

module.exports = router;
