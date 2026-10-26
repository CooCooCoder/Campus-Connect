const { BadRequestError } = require('../utils/errors');

function validateClubCreate(req, res, next) {
  const { name, description, category, contactEmail, logoUrl } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Club name is required and must be at least 2 characters.');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Description is required and must be at least 10 characters.');
  }

  if (!category || typeof category !== 'string') {
    errors.push('Club category is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!contactEmail || typeof contactEmail !== 'string' || !emailRegex.test(contactEmail.trim())) {
    errors.push('A valid contact email address is required.');
  }

  if (errors.length > 0) {
    return next(new BadRequestError('Validation failed for club creation.', errors));
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  req.validatedBody = {
    name: name.trim(),
    slug,
    description: description.trim(),
    category: category.trim(),
    contactEmail: contactEmail.trim().toLowerCase(),
    logoUrl: logoUrl ? logoUrl.trim() : null
  };

  next();
}

module.exports = {
  validateClubCreate
};
