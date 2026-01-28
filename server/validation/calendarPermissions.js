const { validateId } = require('./shared');
const { PERMISSIONS } = require('../../shared/permissions');

function validateCalendarPermissions(permissions) {
  const errors = [];
  if (!permissions) {
    return { valid: false, errors: ['calendarPermissions payload is required.'] };
  }

  errors.push(...validateId(permissions.userId || '', 'calendarPermissions.userId'));
  errors.push(...validateId(permissions.calendarId || '', 'calendarPermissions.calendarId'));

  if (!Array.isArray(permissions.permissions)) {
    errors.push('calendarPermissions.permissions must be an array.');
  } else {
    const allowed = new Set(Object.values(PERMISSIONS));
    permissions.permissions.forEach((perm) => {
      if (!allowed.has(perm)) {
        errors.push(`calendarPermissions.permissions has invalid permission: ${perm}`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateCalendarPermissions,
};
