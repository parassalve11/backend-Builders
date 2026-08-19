const mongoose = require('mongoose');

const STAGE_NAMES = [
  'planning',
  'design',
  'approval',
  'foundation',
  'structure',
  'brickwork',
  'plaster',
  'electrical',
  'plumbing',
  'flooring',
  'painting',
  'finishing',
  'handover',
];

const projectStageSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, enum: STAGE_NAMES, required: true },
    sequence: { type: Number, min: 1, required: true },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'delayed', 'on_hold'],
      default: 'not_started',
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    photos: [{ type: String, trim: true, select: false }],
    approvedPhotos: [{ type: String, trim: true }],
    engineerRemarks: { type: String, maxlength: 2000, select: false },
    adminRemarks: { type: String, maxlength: 2000, select: false },
    customerUpdate: { type: String, maxlength: 1000 },
    customerVisible: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

projectStageSchema.index({ project: 1, name: 1 }, { unique: true });
projectStageSchema.index({ project: 1, sequence: 1 });

module.exports = mongoose.model('ProjectStage', projectStageSchema);
module.exports.STAGE_NAMES = STAGE_NAMES;
