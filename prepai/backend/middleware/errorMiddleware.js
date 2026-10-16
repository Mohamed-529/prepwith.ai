const logger = require("../utils/logger");

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  logger.error(err.message, {
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown errors: don't leak detail in production
  return res.status(err.statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};

module.exports = globalErrorHandler;
