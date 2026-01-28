const {
  ensureValid,
  validateArray,
  validateBoolean,
  validateOptionalString,
  validateRequiredString
} = require("../validation/validators");

const OWNER_TYPES = ["user", "organization"];

function validateCalendar(payload = {}) {
  const errors = [];

  validateRequiredString(payload.id, "id", errors);
  validateRequiredString(payload.name, "name", errors);
  validateRequiredString(payload.ownerId, "ownerId", errors);
  validateRequiredString(payload.ownerType, "ownerType", errors);
  validateOptionalString(payload.color, "color", errors);
  validateArray(payload.sharedOwnerIds || [], "sharedOwnerIds", errors);

  if (payload.ownerType && !OWNER_TYPES.includes(payload.ownerType)) {
    errors.push({ field: "ownerType", message: "ownerType must be user or organization" });
  }

  if (payload.isPublic !== undefined) {
    validateBoolean(payload.isPublic, "isPublic", errors);
  }

  return { valid: errors.length === 0, errors };
}

function createCalendar(payload = {}) {
  const calendar = {
    id: payload.id,
    name: payload.name,
    ownerId: payload.ownerId,
    ownerType: payload.ownerType,
    color: payload.color || "#8FB1FF",
    sharedOwnerIds: payload.sharedOwnerIds || [],
    isPublic: payload.isPublic ?? false,
    createdAt: payload.createdAt || new Date().toISOString()
  };

  ensureValid(validateCalendar(calendar));

  return calendar;
}

module.exports = {
  OWNER_TYPES,
  createCalendar,
  validateCalendar
};
