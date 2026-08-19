module.exports = function validateRequest(schemas) {
  return (req, res, next) => {
    const validated = {};
    const issues = [];

    for (const [location, schema] of Object.entries(schemas)) {
      if (!schema) continue;
      const result = schema.safeParse(req[location]);
      if (result.success) validated[location] = result.data;
      else {
        issues.push(
          ...result.error.issues.map((issue) => ({
            location,
            path: issue.path.join('.'),
            message: issue.message,
          })),
        );
      }
    }

    if (issues.length) {
      return res.status(422).json({
        success: false,
        message: 'Request validation failed',
        errors: issues,
      });
    }

    req.validated = { ...(req.validated || {}), ...validated };
    return next();
  };
};
