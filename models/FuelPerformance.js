const mongoose = require('mongoose');

const FuelPerformanceSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    mileage_arai_kmpl: { type: Number },
    max_power: { type: String },
    max_torque: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('FuelPerformance', FuelPerformanceSchema);
