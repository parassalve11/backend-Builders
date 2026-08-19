const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadRequest' },
    engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'Engineer', required: true, index: true },
    customerName: { type: String, required: true, trim: true, select: false },
    customerPhone: { type: String, required: true, trim: true, select: false },
    customerEmail: { type: String, lowercase: true, trim: true, select: false },
    projectType: { type: String, required: true, trim: true, maxlength: 100 },
    constructionLocation: { type: String, required: true, trim: true, maxlength: 500, select: false },
    publicLocation: { type: String, trim: true, maxlength: 120 },
    builtUpArea: { type: Number, min: 0 },
    floors: { type: Number, min: 0, max: 200 },
    startDate: Date,
    expectedCompletionDate: Date,
    actualCompletionDate: Date,
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'delayed', 'completed', 'cancelled'],
      default: 'planning',
      index: true,
    },
    currentStage: { type: String, trim: true },
    overallProgress: { type: Number, min: 0, max: 100, default: 0 },
    estimatedCost: { type: Number, min: 0, select: false },
    finalCost: { type: Number, min: 0, select: false },
    adminManager: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', select: false },
    delayDays: { type: Number, min: 0, default: 0, select: false },
    delayReason: { type: String, maxlength: 1000, select: false },
    publicDelayDays: { type: Number, min: 0, default: 0 },
    publicSummary: { type: String, trim: true, maxlength: 1000 },
    customerVisible: { type: Boolean, default: false, index: true },
    internalNotes: { type: String, maxlength: 5000, select: false },
  },
  { timestamps: true },
);

projectSchema.index({ status: 1, expectedCompletionDate: 1 });

module.exports = mongoose.model('Project', projectSchema);
