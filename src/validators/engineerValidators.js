const { z, booleanQuerySchema } = require('./commonValidators');

const engineerTypes = ['civil_engineer', 'structural_engineer', 'architect', 'other'];
const availabilityStatuses = ['available', 'limited', 'unavailable'];
const accountStatuses = ['active', 'inactive', 'suspended'];
const verificationStatuses = ['pending', 'under_review', 'verified', 'rejected', 'expired'];

const strongPasswordSchema = z
  .string()
  .min(12, 'Password must contain at least 12 characters')
  .max(128)
  .refine((value) => /[a-z]/.test(value), 'Password must include a lowercase letter')
  .refine((value) => /[A-Z]/.test(value), 'Password must include an uppercase letter')
  .refine((value) => /\d/.test(value), 'Password must include a number')
  .refine((value) => /[^A-Za-z0-9]/.test(value), 'Password must include a symbol');

const rateSchema = z
  .object({
    min: z.coerce.number().min(0),
    max: z.coerce.number().min(0),
    currency: z.literal('INR').default('INR'),
    unit: z.enum(['sq.ft', 'project', 'day']).default('sq.ft'),
  })
  .refine((rate) => rate.max >= rate.min, {
    message: 'Maximum rate must be greater than or equal to minimum rate',
    path: ['max'],
  });

const engineerFields = {
  pseudonymCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^ENG-[A-Z0-9]{3}-[A-Z0-9]{2,8}$/)
    .optional(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(20),
  alternatePhone: z.string().trim().min(10).max(20).optional(),
  email: z.string().trim().email().max(254).optional(),
  exactAddress: z.string().trim().max(500).optional(),
  profilePhoto: z.string().url().optional(),
  emergencyContact: z
    .object({
      name: z.string().trim().max(100).optional(),
      relationship: z.string().trim().max(60).optional(),
      phone: z.string().trim().max(20).optional(),
    })
    .optional(),
  internalContactInformation: z.string().trim().max(1000).optional(),
  employeePartnerId: z.string().trim().max(80).optional(),
  internalNotes: z.string().trim().max(5000).optional(),
  city: z.string().trim().min(2).max(100),
  cityCode: z.string().trim().min(2).max(8).toUpperCase().optional(),
  serviceAreas: z.array(z.string().trim().min(2).max(80)).max(30).default([]),
  engineerType: z.enum(engineerTypes),
  joiningDate: z.coerce.date().optional(),
  accountStatus: z.enum(accountStatuses).default('active'),
  availabilityStatus: z.enum(availabilityStatuses).default('available'),
  yearsExperience: z.coerce.number().min(0).max(70).default(0),
  completedProjectsCount: z.coerce.number().int().min(0).default(0),
  averageProjectDurationMonths: z.coerce.number().min(0).optional(),
  ratePerSqFt: rateSchema.optional(),
  rating: z.coerce.number().min(0).max(5).default(0),
  reviewCount: z.coerce.number().int().min(0).default(0),
  specializations: z.array(z.string().trim().min(2).max(80)).max(30).default([]),
  skills: z.array(z.string().trim().min(2).max(80)).max(50).default([]),
  qualification: z.string().trim().max(150).optional(),
  engineeringBranch: z.string().trim().max(100).optional(),
  college: z.string().trim().max(180).optional(),
  graduationYear: z.coerce.number().int().min(1950).max(2100).optional(),
  professionalExperience: z.string().trim().max(1500).optional(),
  certificationBadges: z.array(z.string().trim().min(2).max(100)).max(30).default([]),
  certifications: z.array(z.string().trim().min(2).max(250)).max(30).default([]),
  professionalRegistration: z.string().trim().max(250).optional(),
  licenseDetails: z.string().trim().max(500).optional(),
  verified: z.boolean().default(false),
  verificationStatus: z.enum(verificationStatuses).default('pending'),
};

const createEngineerBodySchema = z.object(engineerFields);

const updateEngineerBodySchema = z
  .object(
    Object.fromEntries(Object.entries(engineerFields).map(([key, schema]) => [key, schema.optional()])),
  )
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one update');

const engineerStatusBodySchema = z.object({ status: z.enum(accountStatuses) });
const engineerAvailabilityBodySchema = z.object({ availabilityStatus: z.enum(availabilityStatuses) });
const portalAccessBodySchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: strongPasswordSchema,
});

const publicEngineerQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  specialization: z.string().trim().max(80).optional(),
  engineerType: z.enum(engineerTypes).optional(),
  availability: z.enum(availabilityStatuses).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minExperience: z.coerce.number().min(0).max(70).optional(),
  minRate: z.coerce.number().min(0).optional(),
  maxRate: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  sort: z.enum(['rating', 'experience', 'projects', 'rate_low', 'newest']).default('rating'),
});

const adminEngineerQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  accountStatus: z.enum(accountStatuses).optional(),
  availabilityStatus: z.enum(availabilityStatuses).optional(),
  verified: booleanQuerySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const engineerCodeParamsSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^ENG-[A-Z0-9]{3}-[A-Z0-9]{2,8}$/),
});

module.exports = {
  createEngineerBodySchema,
  updateEngineerBodySchema,
  engineerStatusBodySchema,
  engineerAvailabilityBodySchema,
  portalAccessBodySchema,
  publicEngineerQuerySchema,
  adminEngineerQuerySchema,
  engineerCodeParamsSchema,
  engineerTypes,
  availabilityStatuses,
  accountStatuses,
  verificationStatuses,
  strongPasswordSchema,
};
