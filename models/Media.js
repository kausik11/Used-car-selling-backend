const mongoose = require('mongoose');
const applyRequireAllFields = require('./utils/requireAllFields');

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: [true, 'Image url is required'] },
    view_type: {
      type: String,
      required: [true, 'Image view_type is required'],
      enum: ['exterior_360', 'interior_360', 'gallery'],
      default: 'gallery',
    },
    gallery_category: {
      type: String,
      required: [true, 'Image gallery_category is required'],
      enum: ['exterior', 'interior', 'engine', 'tyres', 'top_features', 'extra', 'dents', 'other'],
    },
    // Legacy field kept for backward compatibility.
    kind: {
      type: String,
      required: [
        function requireKindForGallery() {
          return this.view_type === 'gallery';
        },
        'Image kind is required for gallery images',
      ],
      enum: ['exterior', 'interior', 'engine', 'tyres', 'top_features', 'extra', 'dents', 'other'],
      validate: {
        validator: function validateKindForViewType(value) {
          if (this.view_type === 'gallery') return Boolean(value);
          return value === undefined || value === null || value === '';
        },
        message: 'Image kind is only applicable for gallery images',
      },
    },
    sort_order: { type: Number, required: [true, 'Image sort_order is required'] },
  },
  { _id: false }
);

const InspectionReportSchema = new mongoose.Schema(
  {
    url: { type: String, required: [true, 'Inspection report url is required'] },
    type: {
      type: String,
      required: [true, 'Inspection report type is required'],
      enum: ['pdf', 'image'],
    },
  },
  { _id: false }
);

const MediaSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    images: {
      type: [ImageSchema],
      required: [true, 'Images are required'],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one image is required',
      },
    },
    inspection_report: { type: InspectionReportSchema, required: [true, 'Inspection report is required'] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

applyRequireAllFields(MediaSchema);

module.exports = mongoose.model('Media', MediaSchema);
