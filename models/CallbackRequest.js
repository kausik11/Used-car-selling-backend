const mongoose = require('mongoose');

const VALID_STATUSES = ['pending', 'not received', 'done'];

const callbackRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    budgetRange: {
      type: String,
      trim: true,
      default: null,
    },
    preferredBrand: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: 'pending',
    },
    adminComment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CallbackRequest', callbackRequestSchema);
module.exports.VALID_STATUSES = VALID_STATUSES;
