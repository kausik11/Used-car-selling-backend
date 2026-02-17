const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: [
        'Buying',
        'Selling',
        'Post-Sale Support for Car Sellers',
        'Post-Sale Support for Car Buyers',
        'General',
      ],
    },
    question: { type: String, required: true, trim: true, maxlength: 500 },
    answer: { type: String, required: true, trim: true, maxlength: 10000 },
    link: { type: String, trim: true, maxlength: 2000 },
    image: { type: String, trim: true, maxlength: 2000 },
    imagePublicId: { type: String, trim: true, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Faq', FaqSchema);
