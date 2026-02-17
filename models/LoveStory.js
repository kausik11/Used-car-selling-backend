const mongoose = require('mongoose');

const LoveStorySchema = new mongoose.Schema(
  {
    image: { type: String, required: true, trim: true },
    imagePublicId: { type: String, trim: true, default: null },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('LoveStory', LoveStorySchema);
