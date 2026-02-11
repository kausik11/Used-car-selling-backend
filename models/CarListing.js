const mongoose = require('mongoose');

const CustomFieldSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const CarListingSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'sold', 'archived'],
      default: 'draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'hidden'],
      default: 'public',
      index: true,
    },
    title: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true, index: true },
    variant: { type: String },
    fuel_type: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg'],
      index: true,
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'amt', 'cvt', 'dct'],
      index: true,
    },
    body_type: {
      type: String,
      enum: ['hatchback', 'sedan', 'suv', 'muv', 'coupe', 'convertible', 'pickup', 'van'],
      index: true,
    },
    make_year: { type: Number, index: true },
    registration_year: { type: Number, index: true },
    ownership: { type: String, enum: ['first', 'second', 'third', 'fourth_plus'] },
    rto_code: { type: String },
    state: { type: String },
    kms_driven: { type: Number, index: true },
    insurance_valid_till: { type: Date },
    insurance_type: { type: String, enum: ['comprehensive', 'third_party', 'zero_dep', 'none'] },
    city: { type: String, index: true },
    area: { type: String, index: true },
    delivery_available: { type: Boolean, default: false },
    test_drive_available: { type: Boolean, default: false },
    reasons_to_buy: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    overall_score: { type: Number },
    inspection_summary: {
      core_systems: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
      supporting_systems: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
      interiors_ac: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
      exteriors_lights: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
      wear_and_tear: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
    },
    dimensions_capacity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DimensionsCapacity' },
    engine_transmission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EngineTransmission' },
    fuel_performance_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelPerformance' },
    suspension_steering_brakes_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuspensionSteeringBrakes',
    },
    booking_policy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingPolicy' },
    price: {
      amount: { type: Number, index: true },
      currency: { type: String, default: 'INR' },
    },
    listing_ref: { type: String, unique: true, sparse: true, index: true },
    car_slug: { type: String, index: true },
    slug_path: { type: String, unique: true, sparse: true, index: true },
    custom: { type: [CustomFieldSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

CarListingSchema.index({ brand: 1, model: 1 });
CarListingSchema.index({ city: 1, area: 1 });

module.exports = mongoose.model('CarListing', CarListingSchema);
