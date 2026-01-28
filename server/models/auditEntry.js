const {
  ensureValid,
  validateOptionalString,
  validateRequiredString
} = require("../validation/validators");

function validateAuditEntry(payload = {}) {
  const errors = [];

  validateRequiredString(payload.id, "id", errors);
  validateRequiredString(payload.action, "action", errors);
  validateRequiredString(payload.actorId, "actorId", errors);
  validateRequiredString(payload.status, "status", errors);
  validateOptionalString(payload.targetId, "targetId", errors);
  validateOptionalString(payload.details, "details", errors);

  return { valid: errors.length === 0, errors };
}

function createAuditEntry(payload = {}) {
  const entry = {
    id: payload.id,
    action: payload.action,
    actorId: payload.actorId,
    targetId: payload.targetId || "",
    status: payload.status,
    details: payload.details || "",
    createdAt: payload.createdAt || new Date().toISOString()
  };

  ensureValid(validateAuditEntry(entry));

  return entry;
}

module.exports = {
  createAuditEntry,
  validateAuditEntry
};
