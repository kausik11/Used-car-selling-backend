const express = require('express');
const {
  createSellCar,
  listSellCars,
  getSellCar,
  updateSellCar,
  deleteSellCar,
} = require('../controllers/sellCarsController');
const { sellCarUpload } = require('../config/cloudinary');

const router = express.Router();

const sellCarImageUpload = sellCarUpload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 },
  { name: 'interior', maxCount: 1 },
  { name: 'odometer', maxCount: 1 },
]);

router.post('/sell-cars', sellCarImageUpload, createSellCar);
router.get('/sell-cars', listSellCars);
router.get('/sell-cars/:sell_car_id', getSellCar);
router.patch('/sell-cars/:sell_car_id', sellCarImageUpload, updateSellCar);
router.delete('/sell-cars/:sell_car_id', deleteSellCar);

module.exports = router;
