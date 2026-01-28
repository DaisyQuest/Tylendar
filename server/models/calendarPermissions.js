const { validateCalendarPermissions } = require('../validation/calendarPermissions');

function createCalendarPermissions(payload) {
  const result = validateCalendarPermissions(payload);
  if (!result.valid) {
    throw new Error(`Invalid calendar permissions: ${result.errors.join(' ')}`);
  }

  return {
    userId: payload.userId,
    calendarId: payload.calendarId,
    permissions: payload.permissions,
  };
}

module.exports = {
  createCalendarPermissions,
};
