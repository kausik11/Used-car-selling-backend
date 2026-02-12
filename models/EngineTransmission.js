const mongoose = require('mongoose');
const applyRequireAllFields = require('./utils/requireAllFields');

const CustomFieldSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const EngineTransmissionSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    drivetrain: { type: String, enum: ['fwd', 'rwd', 'awd', '4wd'] },
    gearbox: { type: String },
    number_of_gears: { type: Number },
    automatic_transmission_type: { type: String },
    displacement_cc: { type: Number },
    number_of_cylinders: { type: Number },
    valves_per_cylinder: { type: Number },
    turbocharger: { type: Boolean },
    mild_hybrid: { type: Boolean },
    custom: { type: [CustomFieldSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

applyRequireAllFields(EngineTransmissionSchema);

module.exports = mongoose.model('EngineTransmission', EngineTransmissionSchema);
