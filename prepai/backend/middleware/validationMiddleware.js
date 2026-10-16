const { z } = require("zod");
const AppError = require("../utils/AppError");

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        return next(new AppError(`Validation Error: ${errorMessages}`, 400));
      }
      next(error);
    }
  };
};

module.exports = validateRequest;
