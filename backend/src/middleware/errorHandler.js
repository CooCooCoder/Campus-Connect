const { AppError } = require('../utils/errors');
const ApiResponse = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Handle known operational AppError instances
  if (err instanceof AppError) {
    return ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.code,
      err.details
    );
  }

  // Handle syntax error for invalid JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.error(
      res,
      'Request body contains malformed JSON.',
      400,
      'INVALID_JSON'
    );
  }

  // Handle Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? ` (${err.meta.target})` : '';
    return ApiResponse.error(
      res,
      `A record with this identifier already exists${fields}.`,
      409,
      'DUPLICATE_ENTRY'
    );
  }

  // Log unhandled unexpected errors
  console.error('[UNHANDLED_ERROR]', err);

  const isProduction = process.env.NODE_ENV === 'production';
  return ApiResponse.error(
    res,
    isProduction ? 'An internal server error occurred.' : err.message,
    500,
    'INTERNAL_SERVER_ERROR',
    isProduction ? null : err.stack
  );
}

module.exports = errorHandler;
