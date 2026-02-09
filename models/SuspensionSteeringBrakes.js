const mongoose = require('mongoose');

const SuspensionSteeringBrakesSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    suspension_front: { type: String },
    suspension_rear: { type: String },
    steering_type: { type: String },
    steering_adjustment: { type: String },
    brakes: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('SuspensionSteeringBrakes', SuspensionSteeringBrakesSchema);
