const mongoose = require('mongoose');

const FIXED_MODULES = [
  'Core systems',
  'Supporting systems',
  'Interiors & AC',
  'Exteriors & lights',
  'Wear & tear parts',
];

const FIXED_DESCRIPTIONS = [
  'Engine, transmission & chassis',
  'Fuel supply, ignition & other systems',
  'Seats, AC, audio & other features',
  'Panels, glasses, lights & fixtures',
  'Tyres, clutch, brakes & more',
];

const InspectionModuleSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, index: true },
    module: { type: String, required: true, enum: FIXED_MODULES },
    description: { type: String, enum: FIXED_DESCRIPTIONS },
    parts_count: { type: Number },
    assemblies_count: { type: Number },
    score: { type: Number },
    rating: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    },
    summary: { type: String },
    module_image_url: { type: String },
    components: [
      {
        name: { type: String, required: true },
        condition: { type: String, required: true },
        image_url: { type: String },
        issues: { type: [String], default: [] },
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const MODULE_DESCRIPTION_MAP = {
  'Core systems': 'Engine, transmission & chassis',
  'Supporting systems': 'Fuel supply, ignition & other systems',
  'Interiors & AC': 'Seats, AC, audio & other features',
  'Exteriors & lights': 'Panels, glasses, lights & fixtures',
  'Wear & tear parts': 'Tyres, clutch, brakes & more',
};

InspectionModuleSchema.pre('validate', function setFixedDescription(next) {
  if (this.module && MODULE_DESCRIPTION_MAP[this.module]) {
    this.description = MODULE_DESCRIPTION_MAP[this.module];
  }
  next();
});

InspectionModuleSchema.index({ car_id: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('InspectionModule', InspectionModuleSchema);
