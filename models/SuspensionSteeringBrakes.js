const mongoose = require('mongoose');

const SuspensionSteeringBrakesSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    suspension_front_type: { type: String },
    suspension_front: { type: String },
    suspension_rear_type: { type: String },
    suspension_rear: { type: String },
    steering_type: { type: String },
    steering_adjustment: { type: String },
    front_brake_type: { type: String },
    rear_brake_type: { type: String },
    brakes: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('SuspensionSteeringBrakes', SuspensionSteeringBrakesSchema);
