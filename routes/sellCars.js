const express = require('express');
const {
  createSellCar,
  listSellCars,
  getSellCar,
  updateSellCar,
  deleteSellCar,
} = require('../controllers/sellCarsController');
const { sellCarUpload } = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const sellCarImageUpload = sellCarUpload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 },
  { name: 'interior', maxCount: 1 },
  { name: 'odometer', maxCount: 1 },
]);

router.post('/sell-cars', sellCarImageUpload, createSellCar);
router.get('/sell-cars', authMiddleware, listSellCars);
router.get('/sell-cars/:sell_car_id', authMiddleware, getSellCar);
router.patch('/sell-cars/:sell_car_id', authMiddleware, sellCarImageUpload, updateSellCar);
router.delete('/sell-cars/:sell_car_id', authMiddleware, deleteSellCar);

module.exports = router;
