const { z } = require('./commonValidators');
const { availabilityStatuses } = require('./engineerValidators');
const { projectStatus } = require('./projectValidators');

const paginationFields = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
};

const portalProjectQuerySchema = z.object({
  ...paginationFields,
  status: z.enum(projectStatus).optional(),
});

const opportunityQuerySchema = z.object({
  ...paginationFields,
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
});

const availabilityBodySchema = z.object({
  availabilityStatus: z.enum(availabilityStatuses),
});

module.exports = {
  portalProjectQuerySchema,
  opportunityQuerySchema,
  availabilityBodySchema,
};
