const { validateEvent } = require('../validation/event');

function createEvent(payload) {
  const result = validateEvent(payload);
  if (!result.valid) {
    throw new Error(`Invalid event: ${result.errors.join(' ')}`);
  }

  return {
    id: payload.id,
    title: payload.title.trim(),
    description: payload.description || '',
    calendarIds: payload.calendarIds,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    createdBy: payload.createdBy,
  };
}

module.exports = {
  createEvent,
};
