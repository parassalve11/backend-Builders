const mongoose = require('mongoose');

const score = { type: Number, min: 0, max: 100, default: 0 };

const engineerPerformanceSchema = new mongoose.Schema(
  {
    engineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Engineer',
      required: true,
      unique: true,
      index: true,
    },
    totalProjects: { type: Number, min: 0, default: 0 },
    completedProjects: { type: Number, min: 0, default: 0 },
    ongoingProjects: { type: Number, min: 0, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    customerSatisfaction: score,
    averageProjectDurationMonths: { type: Number, min: 0, default: 0 },
    estimationAccuracy: score,
    qualityScore: score,
    onTimeCompletionPercentage: score,
    complaintCount: { type: Number, min: 0, default: 0 },
    currentAssignments: { type: Number, min: 0, default: 0 },
    siteInspectionScore: score,
    safetyCompliance: score,
    reworkCount: { type: Number, min: 0, default: 0 },
    issueCount: { type: Number, min: 0, default: 0 },
    internalNotes: { type: String, maxlength: 5000, select: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('EngineerPerformance', engineerPerformanceSchema);
