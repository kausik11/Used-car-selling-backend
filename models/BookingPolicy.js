const mongoose = require('mongoose');

const BookingPolicySchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    booking_enabled: { type: Boolean, default: false },
    cta_text: { type: String },
    refund_policy: { type: String },
    refund_condition: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('BookingPolicy', BookingPolicySchema);
