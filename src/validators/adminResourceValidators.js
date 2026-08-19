const { z, objectIdSchema, booleanQuerySchema } = require('./commonValidators');

const verificationBodySchema = z.object({
  status: z.enum(['pending', 'under_review', 'verified', 'rejected', 'expired']),
  notes: z.string().trim().max(5000).optional(),
  documentsChecked: z.array(objectIdSchema).max(100).default([]),
  expiresAt: z.coerce.date().optional(),
});

const documentBodySchema = z.object({
  documentType: z.enum([
    'qualification_certificate',
    'experience_certificate',
    'professional_certificate',
    'id_proof',
    'registration_document',
    'licence',
    'agreement',
    'other',
  ]),
  displayName: z.string().trim().min(2).max(180),
  fileUrl: z.string().url(),
  verificationStatus: z
    .enum(['pending', 'under_review', 'verified', 'rejected', 'expired'])
    .default('pending'),
  expiryDate: z.coerce.date().optional(),
  adminNotes: z.string().trim().max(3000).optional(),
});

const updateDocumentBodySchema = documentBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one update',
);

const performanceBodySchema = z.object({
  totalProjects: z.coerce.number().int().min(0).optional(),
  completedProjects: z.coerce.number().int().min(0).optional(),
  ongoingProjects: z.coerce.number().int().min(0).optional(),
  averageRating: z.coerce.number().min(0).max(5).optional(),
  customerSatisfaction: z.coerce.number().min(0).max(100).optional(),
  averageProjectDurationMonths: z.coerce.number().min(0).optional(),
  estimationAccuracy: z.coerce.number().min(0).max(100).optional(),
  qualityScore: z.coerce.number().min(0).max(100).optional(),
  onTimeCompletionPercentage: z.coerce.number().min(0).max(100).optional(),
  complaintCount: z.coerce.number().int().min(0).optional(),
  currentAssignments: z.coerce.number().int().min(0).optional(),
  siteInspectionScore: z.coerce.number().min(0).max(100).optional(),
  safetyCompliance: z.coerce.number().min(0).max(100).optional(),
  reworkCount: z.coerce.number().int().min(0).optional(),
  issueCount: z.coerce.number().int().min(0).optional(),
  internalNotes: z.string().trim().max(5000).optional(),
}).refine((value) => Object.keys(value).length > 0, 'Provide at least one metric');

const reviewBodySchema = z.object({
  engineer: objectIdSchema,
  project: objectIdSchema,
  customerName: z.string().trim().min(2).max(100),
  publicCustomerLabel: z.string().trim().min(2).max(60).default('Verified customer'),
  rating: z.coerce.number().min(1).max(5),
  review: z.string().trim().min(10).max(1500),
  adminApproval: z.boolean().default(false),
  adminNotes: z.string().trim().max(2000).optional(),
});

const updateReviewBodySchema = reviewBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one update',
);

const portfolioBodySchema = z.object({
  projectCode: z.string().trim().toUpperCase().min(4).max(40),
  projectName: z.string().trim().min(2).max(160),
  projectType: z.string().trim().min(2).max(80),
  publicLocation: z.string().trim().max(120).optional(),
  exactLocation: z.string().trim().max(500).optional(),
  privateClientName: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1500).optional(),
  builtUpArea: z.coerce.number().min(0).optional(),
  floors: z.coerce.number().int().min(0).max(200).optional(),
  status: z.enum(['planned', 'ongoing', 'completed', 'on_hold']).default('completed'),
  completionDate: z.coerce.date().optional(),
  photos: z.array(z.string().url()).max(50).default([]),
  plans2D: z.array(z.string().url()).max(20).default([]),
  elevations3D: z.array(z.string().url()).max(20).default([]),
  isPublicApproved: z.boolean().default(false),
});

const updatePortfolioBodySchema = portfolioBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one update',
);

const adminLeadQuerySchema = z.object({
  status: z
    .enum([
      'new',
      'reviewing',
      'contacted',
      'engineer_assigned',
      'project_created',
      'closed',
      'rejected',
      'spam',
    ])
    .optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const adminReviewQuerySchema = z.object({
  approved: booleanQuerySchema.optional(),
  engineer: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const verificationQuerySchema = z.object({
  status: z.enum(['pending', 'under_review', 'verified', 'rejected', 'expired']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const documentQuerySchema = z.object({
  engineer: objectIdSchema.optional(),
  verificationStatus: z
    .enum(['pending', 'under_review', 'verified', 'rejected', 'expired'])
    .optional(),
  documentType: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const performanceQuerySchema = z.object({
  engineer: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  verificationBodySchema,
  documentBodySchema,
  updateDocumentBodySchema,
  performanceBodySchema,
  reviewBodySchema,
  updateReviewBodySchema,
  portfolioBodySchema,
  updatePortfolioBodySchema,
  adminLeadQuerySchema,
  adminReviewQuerySchema,
  verificationQuerySchema,
  documentQuerySchema,
  performanceQuerySchema,
};
