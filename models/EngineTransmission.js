const mongoose = require('mongoose');

const EngineTransmissionSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    drivetrain: { type: String, enum: ['fwd', 'rwd', 'awd', '4wd'] },
    gearbox: { type: String },
    number_of_gears: { type: Number },
    displacement_cc: { type: Number },
    number_of_cylinders: { type: Number },
    valves_per_cylinder: { type: Number },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('EngineTransmission', EngineTransmissionSchema);
