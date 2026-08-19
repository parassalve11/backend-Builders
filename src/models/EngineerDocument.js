const mongoose = require('mongoose');

const engineerDocumentSchema = new mongoose.Schema(
  {
    engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'Engineer', required: true, index: true },
    documentType: {
      type: String,
      enum: [
        'qualification_certificate',
        'experience_certificate',
        'professional_certificate',
        'id_proof',
        'registration_document',
        'licence',
        'agreement',
        'other',
      ],
      required: true,
    },
    displayName: { type: String, required: true, trim: true, maxlength: 180 },
    fileUrl: { type: String, required: true, trim: true, select: false },
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    expiryDate: Date,
    adminNotes: { type: String, maxlength: 3000, select: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('EngineerDocument', engineerDocumentSchema);
