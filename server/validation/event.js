const { isNonEmptyString, validateId } = require('./shared');

function validateEvent(event) {
  const errors = [];
  if (!event) {
    return { valid: false, errors: ['event payload is required.'] };
  }

  errors.push(...validateId(event.id || '', 'event.id'));

  if (!isNonEmptyString(event.title)) {
    errors.push('event.title must be a non-empty string.');
  }

  if (!Array.isArray(event.calendarIds)) {
    errors.push('event.calendarIds must be an array.');
  }

  if (!event.startsAt || !event.endsAt) {
    errors.push('event.startsAt and event.endsAt are required.');
  }

  if (event.startsAt && event.endsAt && event.startsAt > event.endsAt) {
    errors.push('event.startsAt must be before event.endsAt.');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateEvent,
};
