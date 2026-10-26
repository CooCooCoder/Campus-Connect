const { BadRequestError } = require('../utils/errors');

function validateRegistration(req, res, next) {
  const { studentName, studentEmail } = req.body;
  const errors = [];

  if (!studentName || typeof studentName !== 'string' || studentName.trim().length < 2) {
    errors.push('Student name is required and must be at least 2 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!studentEmail || typeof studentEmail !== 'string' || !emailRegex.test(studentEmail.trim())) {
    errors.push('A valid student email address is required (e.g., student@campus.edu).');
  }

  if (errors.length > 0) {
    return next(new BadRequestError('Validation failed for event registration.', errors));
  }

  req.validatedBody = {
    studentName: studentName.trim(),
    studentEmail: studentEmail.trim().toLowerCase()
  };

  next();
}

module.exports = {
  validateRegistration
};
