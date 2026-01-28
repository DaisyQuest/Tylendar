const { isNonEmptyString, validateId } = require('./shared');

function validateCalendar(calendar) {
  const errors = [];
  if (!calendar) {
    return { valid: false, errors: ['calendar payload is required.'] };
  }

  errors.push(...validateId(calendar.id || '', 'calendar.id'));

  if (!isNonEmptyString(calendar.name)) {
    errors.push('calendar.name must be a non-empty string.');
  }

  if (!Array.isArray(calendar.ownerIds)) {
    errors.push('calendar.ownerIds must be an array.');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateCalendar,
};
