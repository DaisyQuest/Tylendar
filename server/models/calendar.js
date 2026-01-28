const { validateCalendar } = require('../validation/calendar');

function createCalendar(payload) {
  const result = validateCalendar(payload);
  if (!result.valid) {
    throw new Error(`Invalid calendar: ${result.errors.join(' ')}`);
  }

  return {
    id: payload.id,
    name: payload.name.trim(),
    ownerIds: payload.ownerIds,
    organizationId: payload.organizationId || null,
  };
}

module.exports = {
  createCalendar,
};
