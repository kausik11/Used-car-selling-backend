const mongoose = require('mongoose');

const InspectionModuleSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, index: true },
    module: { type: String, required: true },
    components: [
      {
        name: { type: String, required: true },
        condition: { type: String, enum: ['ok', 'attention', 'replace'], required: true },
        issues: { type: [String], default: [] },
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

InspectionModuleSchema.index({ car_id: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('InspectionModule', InspectionModuleSchema);
