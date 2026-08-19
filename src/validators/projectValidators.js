const { z, objectIdSchema } = require('./commonValidators');

const projectStatus = ['planning', 'active', 'on_hold', 'delayed', 'completed', 'cancelled'];
const stageNames = [
  'planning',
  'design',
  'approval',
  'foundation',
  'structure',
  'brickwork',
  'plaster',
  'electrical',
  'plumbing',
  'flooring',
  'painting',
  'finishing',
  'handover',
];

const projectFields = {
  projectCode: z.string().trim().toUpperCase().min(5).max(40).optional(),
  lead: objectIdSchema.optional(),
  engineer: objectIdSchema,
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().min(10).max(20),
  customerEmail: z.string().trim().email().max(254).optional(),
  projectType: z.string().trim().min(2).max(100),
  constructionLocation: z.string().trim().min(4).max(500),
  publicLocation: z.string().trim().max(120).optional(),
  builtUpArea: z.coerce.number().positive().optional(),
  floors: z.coerce.number().int().min(0).max(200).optional(),
  startDate: z.coerce.date().optional(),
  expectedCompletionDate: z.coerce.date().optional(),
  actualCompletionDate: z.coerce.date().optional(),
  status: z.enum(projectStatus).default('planning'),
  currentStage: z.enum(stageNames).optional(),
  overallProgress: z.coerce.number().min(0).max(100).default(0),
  estimatedCost: z.coerce.number().min(0).optional(),
  finalCost: z.coerce.number().min(0).optional(),
  delayDays: z.coerce.number().int().min(0).optional(),
  delayReason: z.string().trim().max(1000).optional(),
  publicDelayDays: z.coerce.number().int().min(0).optional(),
  publicSummary: z.string().trim().max(1000).optional(),
  customerVisible: z.boolean().default(false),
  internalNotes: z.string().trim().max(5000).optional(),
};

const dateOrderRefinement = (project) =>
  !project.startDate ||
  !project.expectedCompletionDate ||
  project.expectedCompletionDate >= project.startDate;

const createProjectBodySchema = z
  .object(projectFields)
  .refine(dateOrderRefinement, {
    message: 'Expected completion date must be on or after the start date',
    path: ['expectedCompletionDate'],
  });

const updateProjectBodySchema = z
  .object(Object.fromEntries(Object.entries(projectFields).map(([key, schema]) => [key, schema.optional()])))
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one update')
  .refine(dateOrderRefinement, {
    message: 'Expected completion date must be on or after the start date',
    path: ['expectedCompletionDate'],
  });

const stageObjectSchema = z.object({
    name: z.enum(stageNames),
    sequence: z.coerce.number().int().min(1).max(99),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(['not_started', 'in_progress', 'completed', 'delayed', 'on_hold']).default('not_started'),
    progress: z.coerce.number().min(0).max(100).default(0),
    photos: z.array(z.string().url()).max(50).default([]),
    approvedPhotos: z.array(z.string().url()).max(50).default([]),
    engineerRemarks: z.string().trim().max(2000).optional(),
    adminRemarks: z.string().trim().max(2000).optional(),
    customerUpdate: z.string().trim().max(1000).optional(),
    customerVisible: z.boolean().default(false),
  });

const stageBodySchema = stageObjectSchema.refine(
  (stage) => !stage.startDate || !stage.endDate || stage.endDate >= stage.startDate,
  {
    message: 'Stage end date must be on or after its start date',
    path: ['endDate'],
  },
);

const updateStageBodySchema = stageObjectSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one update')
  .refine((stage) => !stage.startDate || !stage.endDate || stage.endDate >= stage.startDate, {
    message: 'Stage end date must be on or after its start date',
    path: ['endDate'],
  });

const publicProjectParamsSchema = z.object({
  projectCode: z.string().trim().toUpperCase().min(5).max(40),
});

const stageParamsSchema = z.object({ id: objectIdSchema, stageId: objectIdSchema });

const adminProjectQuerySchema = z.object({
  status: z.enum(projectStatus).optional(),
  engineer: objectIdSchema.optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const estimateBodySchema = z.object({
  estimatedConstructionCost: z.coerce.number().min(0),
  actualCost: z.coerce.number().min(0).optional(),
  builtUpArea: z.coerce.number().min(0).optional(),
  costPerSqFt: z.coerce.number().min(0).optional(),
  materialCost: z.coerce.number().min(0).optional(),
  labourCost: z.coerce.number().min(0).optional(),
  otherCost: z.coerce.number().min(0).optional(),
  estimationDate: z.coerce.date().optional(),
  finalCost: z.coerce.number().min(0).optional(),
  notes: z.string().trim().max(3000).optional(),
});

const updateEstimateBodySchema = estimateBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one update',
);

module.exports = {
  createProjectBodySchema,
  updateProjectBodySchema,
  stageBodySchema,
  updateStageBodySchema,
  publicProjectParamsSchema,
  stageParamsSchema,
  adminProjectQuerySchema,
  estimateBodySchema,
  updateEstimateBodySchema,
  projectStatus,
  stageNames,
};
