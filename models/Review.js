const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    reviewer_name: { type: String, required: true, trim: true, maxlength: 120 },
    review_date: { type: Date, required: true, index: true },
    city: { type: String, required: true, trim: true, maxlength: 80, index: true },
    review_text: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Review', ReviewSchema);
