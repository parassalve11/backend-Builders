const { z } = require('./commonValidators');

const cityBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(2).max(8).toUpperCase(),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  state: z.string().trim().min(2).max(100),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const updateCityBodySchema = cityBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one update',
);

module.exports = { cityBodySchema, updateCityBodySchema };
