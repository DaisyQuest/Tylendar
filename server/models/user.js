const {
  ensureValid,
  validateOptionalString,
  validateRequiredString
} = require("../validation/validators");

function validateUser(payload = {}) {
  const errors = [];

  validateRequiredString(payload.id, "id", errors);
  validateRequiredString(payload.name, "name", errors);
  validateRequiredString(payload.email, "email", errors);
  validateOptionalString(payload.organizationId, "organizationId", errors);
  validateOptionalString(payload.role, "role", errors);
  validateOptionalString(payload.passwordHash, "passwordHash", errors);

  return { valid: errors.length === 0, errors };
}

function createUser(payload = {}) {
  const user = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    organizationId: payload.organizationId,
    role: payload.role || "member",
    passwordHash: payload.passwordHash,
    createdAt: payload.createdAt || new Date().toISOString()
  };

  ensureValid(validateUser(user));

  return user;
}

module.exports = {
  createUser,
  validateUser
};
