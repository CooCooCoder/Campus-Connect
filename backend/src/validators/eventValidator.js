const { BadRequestError } = require('../utils/errors');

function validateEventCreate(req, res, next) {
  const { title, description, category, venue, date, capacity, clubId } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters.');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Description is required and must be at least 10 characters.');
  }

  const validCategories = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Literary', 'Management', 'Other'];
  if (!category || !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}.`);
  }

  if (!venue || typeof venue !== 'string' || venue.trim().length < 2) {
    errors.push('Venue is required and must be at least 2 characters.');
  }

  if (!date || isNaN(Date.parse(date))) {
    errors.push('A valid date is required.');
  }

  const parsedCapacity = parseInt(capacity, 10);
  if (isNaN(parsedCapacity) || parsedCapacity < 1) {
    errors.push('Capacity must be a positive integer greater than or equal to 1.');
  }

  if (!clubId || typeof clubId !== 'string') {
    errors.push('Associated clubId is required.');
  }

  if (errors.length > 0) {
    return next(new BadRequestError('Validation failed for event creation.', errors));
  }

  req.validatedBody = {
    title: title.trim(),
    description: description.trim(),
    category,
    venue: venue.trim(),
    date: new Date(date),
    capacity: parsedCapacity,
    clubId
  };

  next();
}

function validateEventUpdate(req, res, next) {
  const { title, description, category, venue, date, capacity, status, clubId } = req.body;
  const updates = {};
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      errors.push('Title must be at least 3 characters.');
    } else {
      updates.title = title.trim();
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 10) {
      errors.push('Description must be at least 10 characters.');
    } else {
      updates.description = description.trim();
    }
  }

  if (category !== undefined) {
    const validCategories = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Literary', 'Management', 'Other'];
    if (!validCategories.includes(category)) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}.`);
    } else {
      updates.category = category;
    }
  }

  if (venue !== undefined) {
    if (typeof venue !== 'string' || venue.trim().length < 2) {
      errors.push('Venue must be at least 2 characters.');
    } else {
      updates.venue = venue.trim();
    }
  }

  if (date !== undefined) {
    if (isNaN(Date.parse(date))) {
      errors.push('Date must be a valid date.');
    } else {
      updates.date = new Date(date);
    }
  }

  if (capacity !== undefined) {
    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity < 1) {
      errors.push('Capacity must be a positive integer greater than or equal to 1.');
    } else {
      updates.capacity = parsedCapacity;
    }
  }

  if (status !== undefined) {
    const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}.`);
    } else {
      updates.status = status;
    }
  }

  if (clubId !== undefined) {
    updates.clubId = clubId;
  }

  if (errors.length > 0) {
    return next(new BadRequestError('Validation failed for event update.', errors));
  }

  req.validatedBody = updates;
  next();
}

module.exports = {
  validateEventCreate,
  validateEventUpdate
};
