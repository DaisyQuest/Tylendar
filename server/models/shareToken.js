const {
  ensureValid,
  validateArray,
  validateOptionalString,
  validateRequiredString
} = require("../validation/validators");
const { PERMISSIONS } = require("./calendarPermissions");

function validateShareToken(payload = {}) {
  const errors = [];

  validateRequiredString(payload.id, "id", errors);
  validateRequiredString(payload.calendarId, "calendarId", errors);
  validateRequiredString(payload.token, "token", errors);
  validateRequiredString(payload.createdBy, "createdBy", errors);
  validateArray(payload.permissions || [], "permissions", errors, { minLength: 1 });
  validateOptionalString(payload.expiresAt, "expiresAt", errors);

  if (Array.isArray(payload.permissions)) {
    payload.permissions.forEach((permission) => {
      if (!PERMISSIONS.includes(permission)) {
        errors.push({ field: "permissions", message: `Invalid permission: ${permission}` });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

function createShareToken(payload = {}) {
  const shareToken = {
    id: payload.id,
    calendarId: payload.calendarId,
    token: payload.token,
    createdBy: payload.createdBy,
    permissions: payload.permissions || [],
    expiresAt: payload.expiresAt,
    createdAt: payload.createdAt || new Date().toISOString()
  };

  ensureValid(validateShareToken(shareToken));

  return shareToken;
}

module.exports = {
  createShareToken,
  validateShareToken
};
