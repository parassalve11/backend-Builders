const { z } = require('./commonValidators');

const loginBodySchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

module.exports = { loginBodySchema };
