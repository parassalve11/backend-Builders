const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const rateSchema = new mongoose.Schema(
  {
    min: { type: Number, min: 0, default: 0 },
    max: { type: Number, min: 0, default: 0 },
    currency: { type: String, enum: ['INR'], default: 'INR' },
    unit: { type: String, enum: ['sq.ft', 'project', 'day'], default: 'sq.ft' },
  },
  { _id: false },
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: String,
    relationship: String,
    phone: String,
  },
  { _id: false },
);

const engineerSchema = new mongoose.Schema(
  {
    pseudonymCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^ENG-[A-Z0-9]{3}-[A-Z0-9]{2,8}$/,
      index: true,
    },

    // Identity and contact fields are private by default.
    fullName: { type: String, required: true, trim: true, maxlength: 120, select: false },
    phone: { type: String, required: true, trim: true, select: false },
    alternatePhone: { type: String, trim: true, select: false },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 254,
      unique: true,
      sparse: true,
      select: false,
    },
    password: { type: String, minlength: 12, select: false },
    tokenVersion: { type: Number, min: 0, default: 0, select: false },
    lastLoginAt: { type: Date, select: false },
    exactAddress: { type: String, trim: true, maxlength: 500, select: false },
    profilePhoto: { type: String, trim: true, select: false },
    emergencyContact: { type: emergencyContactSchema, select: false },
    internalContactInformation: { type: String, maxlength: 1000, select: false },
    employeePartnerId: { type: String, trim: true, unique: true, sparse: true, select: false },
    internalNotes: { type: String, maxlength: 5000, select: false },

    city: { type: String, required: true, trim: true, index: true },
    cityCode: { type: String, required: true, uppercase: true, trim: true, maxlength: 8 },
    serviceAreas: [{ type: String, trim: true, maxlength: 80 }],
    engineerType: {
      type: String,
      enum: ['civil_engineer', 'structural_engineer', 'architect', 'other'],
      required: true,
      index: true,
    },
    registrationDate: { type: Date, default: Date.now },
    joiningDate: Date,
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'limited', 'unavailable'],
      default: 'available',
      index: true,
    },
    yearsExperience: { type: Number, min: 0, max: 70, default: 0 },
    completedProjectsCount: { type: Number, min: 0, default: 0 },
    averageProjectDurationMonths: { type: Number, min: 0, default: null },
    ratePerSqFt: { type: rateSchema, default: () => ({}) },
    rating: { type: Number, min: 0, max: 5, default: 0, index: true },
    reviewCount: { type: Number, min: 0, default: 0 },
    specializations: [{ type: String, trim: true, maxlength: 80 }],
    skills: [{ type: String, trim: true, maxlength: 80 }],
    qualification: { type: String, trim: true, maxlength: 150 },
    engineeringBranch: { type: String, trim: true, maxlength: 100 },
    college: { type: String, trim: true, maxlength: 180, select: false },
    graduationYear: { type: Number, min: 1950, max: 2100, select: false },
    professionalExperience: { type: String, trim: true, maxlength: 1500 },
    certificationBadges: [{ type: String, trim: true, maxlength: 100 }],
    certifications: [{ type: String, trim: true, maxlength: 250, select: false }],
    professionalRegistration: { type: String, trim: true, select: false },
    licenseDetails: { type: String, trim: true, select: false },
    verified: { type: Boolean, default: false, index: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected', 'expired'],
      default: 'pending',
      select: false,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

engineerSchema.index({ city: 1, verified: 1, accountStatus: 1, availabilityStatus: 1 });
engineerSchema.index({ specializations: 1, rating: -1 });

engineerSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

engineerSchema.methods.verifyPassword = function verifyPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Engineer', engineerSchema);
