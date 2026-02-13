const mongoose = require('mongoose');

const RecentCarViewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    car_id: {
      type: String,
      required: true,
      index: true,
    },
    viewed_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

RecentCarViewSchema.index({ user_id: 1, car_id: 1 }, { unique: true });

module.exports = mongoose.model('RecentCarView', RecentCarViewSchema);
