const express = require('express');
const {
  createCar,
  updateCar,
  deleteCar,
  getCar,
  getCarBySlug,
  listCars,
  uploadMedia,
} = require('../controllers/carsController');
const { upload } = require('../config/cloudinary');
const { authMiddleware, adminOrAdministrator } = require('../middleware/auth');

const router = express.Router();


// car related routs
router.post('/cars', authMiddleware, adminOrAdministrator, createCar);
router.patch('/cars/:car_id', authMiddleware, adminOrAdministrator, updateCar);
router.delete('/cars/:car_id', authMiddleware, adminOrAdministrator, deleteCar);
router.get('/buy-used-cars/:city/:brand/:model/:car_slug/:listing_ref', getCarBySlug);
router.get('/cars/:car_id', getCar);
router.get('/cars', listCars);

router.post('/cars/:car_id/media', authMiddleware, upload.any(), uploadMedia);

module.exports = router;
