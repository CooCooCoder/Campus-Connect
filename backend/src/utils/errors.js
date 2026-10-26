class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request', details = null) {
    super(message, 400, 'BAD_REQUEST');
    this.details = details;
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

class CapacityExceededError extends AppError {
  constructor(message = 'Event capacity has been reached. No seats available.') {
    super(message, 409, 'CAPACITY_EXCEEDED');
  }
}

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  CapacityExceededError
};
