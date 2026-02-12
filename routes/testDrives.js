const express = require('express');
const {
  createTestDriveBooking,
  listTestDriveBookings,
  getTestDriveBookingsByCar,
  updateTestDriveBooking,
  deleteTestDriveBooking,
  getTestDriveSlots,
} = require('../controllers/testDriveBookingsController');

const router = express.Router();

router.post('/test-drives', createTestDriveBooking);
router.get('/test-drives', listTestDriveBookings);
router.get('/test-drives/slots', getTestDriveSlots); //no use case
router.get('/cars/:car_id/test-drives', getTestDriveBookingsByCar);
router.patch('/test-drives/:booking_id', updateTestDriveBooking);
router.delete('/test-drives/:booking_id', deleteTestDriveBooking);

module.exports = router;
