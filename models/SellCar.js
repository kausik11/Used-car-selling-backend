const mongoose = require('mongoose');

const cloudinaryImageField = {
  type: String,
  required: true,
  trim: true,
  validate: {
    validator: (value) => typeof value === 'string' && value.includes('cloudinary.com'),
    message: 'Image must be a Cloudinary URL',
  },
};

const SellCarSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    variant: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg'],
      required: true,
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'amt', 'cvt', 'dct'],
      required: true,
    },
    kmDriven: { type: Number, required: true },
    owner: {
      type: String,
      enum: ['first', 'second', 'third', 'fourth_plus'],
      required: true,
    },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'average', 'needs_work'],
      required: true,
    },
    accidentHistory: { type: Boolean, default: false },
    expectedPrice: { type: Number, required: true },
    negotiable: { type: Boolean, default: true },
    images: {
      front: cloudinaryImageField,
      back: cloudinaryImageField,
      interior: cloudinaryImageField,
      odometer: cloudinaryImageField,
    },
    seller: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
      phoneNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
      phoneVerified: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sold'],
      default: 'pending',
    },
    adminStatement: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellCar', SellCarSchema);
