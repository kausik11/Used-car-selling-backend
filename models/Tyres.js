const mongoose = require('mongoose');

const TyreSchema = new mongoose.Schema(
  {
    brand: { type: String },
    size: { type: String },
    condition: { type: String, enum: ['new', 'good', 'fair', 'poor'] },
    tread_mm: { type: Number },
  },
  { _id: false }
);

const TyresSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    front: TyreSchema,
    rear: TyreSchema,
    spare: TyreSchema,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Tyres', TyresSchema);
