const { z } = require('./commonValidators');

const indianPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ''))
  .refine((value) => /^(?:\+91)?[6-9]\d{9}$/.test(value), 'Enter a valid Indian mobile number')
  .transform((value) => value.replace(/^\+91/, ''));

const optionalEmailSchema = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.string().trim().email().max(254).transform((value) => value.toLowerCase()).optional(),
);

const budgetRangeSchema = z
  .object({
    min: z.coerce.number().min(0).optional(),
    max: z.coerce.number().min(0).optional(),
    currency: z.literal('INR').default('INR'),
  })
  .refine(
    (budget) => budget.min === undefined || budget.max === undefined || budget.max >= budget.min,
    { message: 'Maximum budget must be greater than or equal to minimum budget', path: ['max'] },
  )
  .refine((budget) => budget.min !== undefined || budget.max !== undefined, {
    message: 'Provide a minimum or maximum budget',
  });

const budgetInputSchema = z.union([
  z.string().trim().min(1).max(100),
  budgetRangeSchema,
]);

const createLeadBodySchema = z.object({
  engineerCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^ENG-[A-Z0-9]{3}-[A-Z0-9]{2,8}$/, 'Invalid engineer code')
    .optional(),
  customerName: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[\p{L}][\p{L}\s.'-]*$/u, 'Customer name contains invalid characters'),
  phone: indianPhoneSchema,
  email: optionalEmailSchema,
  city: z.string().trim().min(2).max(100),
  projectType: z.string().trim().min(2).max(100),
  projectDetails: z.string().trim().min(10).max(2000),
  approximateArea: z.coerce.number().positive().max(10_000_000).optional(),
  budgetRange: budgetInputSchema.optional(),
  preferredStartDate: z.coerce.date().optional(),
  consentToContact: z.literal(true, {
    errorMap: () => ({ message: 'Consent to contact is required' }),
  }),
  source: z.enum(['quote', 'engineer_request', 'website']).optional(),
  website: z.string().max(0).optional(),
});

const updateLeadBodySchema = z
  .object({
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
    adminNotes: z.string().trim().max(5000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one update');

const assignEngineerBodySchema = z.object({
  engineerId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid engineer id'),
});

module.exports = {
  indianPhoneSchema,
  createLeadBodySchema,
  updateLeadBodySchema,
  assignEngineerBodySchema,
  budgetInputSchema,
};
