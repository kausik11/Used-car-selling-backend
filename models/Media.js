const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    images: [
      {
        url: { type: String, required: true },
        kind: { type: String, enum: ['exterior', 'interior', 'engine', 'tyres', 'other'] },
        sort_order: { type: Number },
      },
    ],
    inspection_report: {
      url: { type: String },
      type: { type: String, enum: ['pdf', 'image'] },
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Media', MediaSchema);
