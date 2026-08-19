const mongoose = require('mongoose');

const projectEstimateSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    estimatedConstructionCost: { type: Number, min: 0, required: true },
    actualCost: { type: Number, min: 0 },
    builtUpArea: { type: Number, min: 0 },
    costPerSqFt: { type: Number, min: 0 },
    materialCost: { type: Number, min: 0 },
    labourCost: { type: Number, min: 0 },
    otherCost: { type: Number, min: 0 },
    estimationDate: { type: Date, default: Date.now },
    finalCost: { type: Number, min: 0 },
    notes: { type: String, maxlength: 3000, select: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ProjectEstimate', projectEstimateSchema);
