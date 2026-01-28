const {
  ensureValid,
  validateArray,
  validateOptionalString,
  validateRequiredString
} = require("../validation/validators");

function validateRole(payload = {}) {
  const errors = [];

  validateRequiredString(payload.id, "id", errors);
  validateRequiredString(payload.orgId, "orgId", errors);
  validateRequiredString(payload.name, "name", errors);
  validateArray(payload.permissions || [], "permissions", errors, { minLength: 1 });
  validateOptionalString(payload.description, "description", errors);

  return { valid: errors.length === 0, errors };
}

function createRole(payload = {}) {
  const role = {
    id: payload.id,
    orgId: payload.orgId,
    name: payload.name,
    permissions: payload.permissions || [],
    description: payload.description || "",
    createdAt: payload.createdAt || new Date().toISOString()
  };

  ensureValid(validateRole(role));

  return role;
}

module.exports = {
  createRole,
  validateRole
};
