const mongoose = require('mongoose');

const CarFeaturesSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    safety: {
      abs: { type: Boolean },
      airbags: { type: String, enum: ['none', 'driver', 'dual', 'curtain', 'multiple'] },
      rear_camera: { type: Boolean },
      parking_sensors: { type: String, enum: ['none', 'rear', 'front_rear'] },
      traction_control: { type: Boolean },
      hill_assist: { type: Boolean },
    },
    comfort: {
      climate_control: { type: Boolean },
      rear_ac: { type: Boolean },
      power_steering: { type: Boolean },
      power_windows: { type: String, enum: ['none', 'front', 'all'] },
      keyless_entry: { type: Boolean },
      cruise_control: { type: Boolean },
      sunroof: { type: String, enum: ['none', 'standard', 'panoramic'] },
    },
    entertainment: {
      touchscreen: { type: Boolean },
      bluetooth: { type: Boolean },
      android_auto: { type: Boolean },
      apple_carplay: { type: Boolean },
      speakers: { type: Number },
    },
    interior: {
      upholstery: { type: String, enum: ['fabric', 'leather', 'leatherette'] },
      adjustable_headrests: { type: Boolean },
      ambient_lighting: { type: Boolean },
    },
    exterior: {
      fog_lamps: { type: Boolean },
      led_headlamps: { type: Boolean },
      roof_rails: { type: Boolean },
      rear_wiper: { type: Boolean },
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('CarFeatures', CarFeaturesSchema);
