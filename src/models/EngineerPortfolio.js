const mongoose = require('mongoose');

const engineerPortfolioSchema = new mongoose.Schema(
  {
    engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'Engineer', required: true, index: true },
    projectCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    projectName: { type: String, required: true, trim: true, maxlength: 160 },
    projectType: { type: String, required: true, trim: true, maxlength: 80 },
    publicLocation: { type: String, trim: true, maxlength: 120 },
    exactLocation: { type: String, trim: true, maxlength: 500, select: false },
    privateClientName: { type: String, trim: true, maxlength: 120, select: false },
    description: { type: String, trim: true, maxlength: 1500 },
    builtUpArea: { type: Number, min: 0 },
    floors: { type: Number, min: 0, max: 200 },
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed', 'on_hold'],
      default: 'completed',
    },
    completionDate: Date,
    photos: [{ type: String, trim: true }],
    plans2D: [{ type: String, trim: true }],
    elevations3D: [{ type: String, trim: true }],
    isPublicApproved: { type: Boolean, default: false, index: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', select: false },
    approvedAt: { type: Date, select: false },
  },
  { timestamps: true },
);

engineerPortfolioSchema.index({ engineer: 1, isPublicApproved: 1, completionDate: -1 });

module.exports = mongoose.model('EngineerPortfolio', engineerPortfolioSchema);
