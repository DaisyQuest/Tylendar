const {
  ensureValid,
  validateArray,
  validateRequiredString
} = require("../validation/validators");

const PERMISSIONS = [
  "View Calendar",
  "View Calendar - Times Only",
  "Add to Calendar",
  "Comment on Calendar",
  "Manage Calendar"
];

function validateCalendarPermissions(payload = {}) {
  const errors = [];

  validateRequiredString(payload.id, "id", errors);
  validateRequiredString(payload.calendarId, "calendarId", errors);
  validateRequiredString(payload.userId, "userId", errors);
  validateRequiredString(payload.grantedBy, "grantedBy", errors);
  validateArray(payload.permissions || [], "permissions", errors, { minLength: 1 });

  if (Array.isArray(payload.permissions)) {
    payload.permissions.forEach((permission) => {
      if (!PERMISSIONS.includes(permission)) {
        errors.push({ field: "permissions", message: `Invalid permission: ${permission}` });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

function createCalendarPermissions(payload = {}) {
  const permissions = {
    id: payload.id,
    calendarId: payload.calendarId,
    userId: payload.userId,
    grantedBy: payload.grantedBy,
    permissions: payload.permissions || [],
    createdAt: payload.createdAt || new Date().toISOString()
  };

  ensureValid(validateCalendarPermissions(permissions));

  return permissions;
}

module.exports = {
  PERMISSIONS,
  createCalendarPermissions,
  validateCalendarPermissions
};
