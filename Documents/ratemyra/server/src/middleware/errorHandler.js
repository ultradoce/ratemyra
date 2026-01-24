/**
 * Enhanced error handling middleware
 */

export function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('========== ERROR HANDLER ==========');
  console.error('URL:', req.method, req.url);
  console.error('Error:', err);
  console.error('Error name:', err.name);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  if (err.stack) {
    console.error('Stack trace:', err.stack);
  }
  if (err.meta) {
    console.error('Error meta:', err.meta);
  }
  console.error('===================================');

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'This record already exists',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Not found',
        message: 'The requested resource was not found',
      });
    }
    if (err.code === 'P1001') {
      return res.status(503).json({
        error: 'Database connection failed',
        message: 'Unable to connect to database. Please check DATABASE_URL configuration.',
      });
    }
    if (err.code === 'P1012') {
      return res.status(500).json({
        error: 'Database configuration error',
        message: 'Database URL not found or invalid. Please check DATABASE_URL environment variable.',
      });
    }
    return res.status(400).json({
      error: 'Database error',
      code: err.code,
      message: err.message,
    });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.errors) {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
      errors: err.errors,
    });
  }

  // Default error
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Always include error code and message in response
  const response = {
    error: message,
    code: err.code || 'UNKNOWN_ERROR',
  };

  // Include stack trace in development or if explicitly requested
  if (process.env.NODE_ENV === 'development' || req.query.debug === 'true') {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(status).json(response);
}
