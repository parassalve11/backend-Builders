const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'Engineer', required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    customerName: { type: String, required: true, trim: true, maxlength: 100, select: false },
    publicCustomerLabel: { type: String, default: 'Verified customer', trim: true, maxlength: 60 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, trim: true, maxlength: 1500 },
    adminApproval: { type: Boolean, default: false, index: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', select: false },
    approvedAt: { type: Date, select: false },
    adminNotes: { type: String, maxlength: 2000, select: false },
  },
  { timestamps: true },
);

reviewSchema.index({ engineer: 1, adminApproval: 1, createdAt: -1 });
reviewSchema.index({ project: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
