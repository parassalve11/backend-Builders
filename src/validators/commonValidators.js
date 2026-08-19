const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource id');
const booleanQuerySchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');
const optionalText = (max) => z.string().trim().max(max).optional();
const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParamsSchema = z.object({ id: objectIdSchema });

module.exports = {
  z,
  objectIdSchema,
  booleanQuerySchema,
  optionalText,
  paginationQuerySchema,
  idParamsSchema,
};
