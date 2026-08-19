const mongoose = require('mongoose');

const engineerVerificationSchema = new mongoose.Schema(
  {
    engineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Engineer',
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    verificationDate: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    notes: { type: String, trim: true, maxlength: 5000, select: false },
    documentsChecked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EngineerDocument' }],
    expiresAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model('EngineerVerification', engineerVerificationSchema);
