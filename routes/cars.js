const express = require('express');
const {
  createCar,
  updateCar,
  deleteCar,
  getCar,
  listCars,
  uploadMedia,
} = require('../controllers/carsController');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.post('/cars', createCar);
router.patch('/cars/:car_id', updateCar);
router.delete('/cars/:car_id', deleteCar);
router.get('/cars/:car_id', getCar);
router.get('/cars', listCars);

router.post(
  '/cars/:car_id/media',
  upload.fields([
    { name: 'images', maxCount: 20 },
    { name: 'inspection_report', maxCount: 1 },
  ]),
  uploadMedia
);

module.exports = router;
