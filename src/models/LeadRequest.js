const mongoose = require('mongoose');

const leadRequestSchema = new mongoose.Schema(
  {
    leadCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'Engineer', index: true },
    engineerCode: { type: String, uppercase: true, index: true },
    customerName: { type: String, required: true, trim: true, maxlength: 100, select: false },
    phone: { type: String, required: true, trim: true, select: false },
    email: { type: String, lowercase: true, trim: true, select: false },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    projectType: { type: String, required: true, trim: true, maxlength: 100 },
    projectDetails: { type: String, required: true, trim: true, maxlength: 2000, select: false },
    approximateArea: { type: Number, min: 0 },
    budgetRange: { type: mongoose.Schema.Types.Mixed, select: false },
    preferredStartDate: Date,
    status: {
      type: String,
      enum: [
        'new',
        'reviewing',
        'contacted',
        'engineer_assigned',
        'project_created',
        'closed',
        'rejected',
        'spam',
      ],
      default: 'new',
      index: true,
    },
    assignedEngineer: { type: mongoose.Schema.Types.ObjectId, ref: 'Engineer' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    adminNotes: { type: String, maxlength: 5000, select: false },
    source: {
      type: String,
      enum: ['quote', 'engineer_request', 'website'],
      default: 'website',
      maxlength: 50,
    },
    consentToContact: { type: Boolean, required: true },
  },
  { timestamps: true },
);

leadRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('LeadRequest', leadRequestSchema);
