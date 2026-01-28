const {
  ensureValid,
  validateArray,
  validateOptionalString,
  validateRequiredString
} = require("../validation/validators");

function validateOrganization(payload = {}) {
  const errors = [];

  validateRequiredString(payload.id, "id", errors);
  validateRequiredString(payload.name, "name", errors);
  validateOptionalString(payload.description, "description", errors);
  validateArray(payload.roles || [], "roles", errors);

  return { valid: errors.length === 0, errors };
}

function createOrganization(payload = {}) {
  const organization = {
    id: payload.id,
    name: payload.name,
    description: payload.description || "",
    roles: payload.roles || ["owner", "admin", "member"],
    createdAt: payload.createdAt || new Date().toISOString()
  };

  ensureValid(validateOrganization(organization));

  return organization;
}

module.exports = {
  createOrganization,
  validateOrganization
};
