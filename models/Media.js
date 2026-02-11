const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    images: [
      {
        url: { type: String, required: true },
        view_type: { type: String, enum: ['exterior_360', 'interior_360', 'gallery'], default: 'gallery' },
        gallery_category: {
          type: String,
          enum: ['exterior', 'interior', 'engine', 'tyres', 'top_features', 'extra', 'dents', 'other'],
        },
        // Legacy field kept for backward compatibility.
        kind: { type: String, enum: ['exterior', 'interior', 'engine', 'tyres', 'top_features', 'extra', 'dents', 'other'] },
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
