const mongoose = require('mongoose');
const applyRequireAllFields = require('./utils/requireAllFields');

const TyreSchema = new mongoose.Schema(
  {
    brand: { type: String, required: [true, 'Tyre brand is required'] },
    size: { type: String, required: [true, 'Tyre size is required'] },
    condition: {
      type: String,
      required: [true, 'Tyre condition is required'],
      enum: ['new', 'good', 'fair', 'poor'],
    },
    tread_mm: { type: Number, required: [true, 'Tyre tread depth is required'] },
  },
  { _id: false }
);

const TyresSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    front: { type: TyreSchema, required: [true, 'Front tyre details are required'] },
    rear: { type: TyreSchema, required: [true, 'Rear tyre details are required'] },
    spare: { type: TyreSchema, required: [true, 'Spare tyre details are required'] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

applyRequireAllFields(TyresSchema);

module.exports = mongoose.model('Tyres', TyresSchema);
