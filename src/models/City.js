const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    code: { type: String, required: true, uppercase: true, trim: true, maxlength: 8 },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

citySchema.index({ name: 1, state: 1 }, { unique: true });

module.exports = mongoose.model('City', citySchema);
