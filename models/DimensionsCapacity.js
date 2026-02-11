const mongoose = require('mongoose');

const CustomFieldSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const DimensionsCapacitySchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    ground_clearance_mm: { type: Number },
    boot_space_litres: { type: Number },
    seating_rows: { type: Number },
    seating_capacity: { type: Number },
    wheelbase_mm: { type: Number },
    length_mm: { type: Number },
    width_mm: { type: Number },
    height_mm: { type: Number },
    kerb_weight_kgs: { type: Number },
    maximum_tread_depth_mm: { type: Number },
    number_of_doors: { type: Number },
    front_tyre_size: { type: String },
    rear_tyre_size: { type: String },
    alloy_wheels: { type: Boolean },
    wheel_cover: { type: Boolean },
    custom: { type: [CustomFieldSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('DimensionsCapacity', DimensionsCapacitySchema);
