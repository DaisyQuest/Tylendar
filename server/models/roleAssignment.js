const {
  ensureValid,
  validateDate,
  validateRequiredString
} = require("../validation/validators");

function validateRoleAssignment(payload = {}) {
  const errors = [];

  validateRequiredString(payload.id, "id", errors);
  validateRequiredString(payload.orgId, "orgId", errors);
  validateRequiredString(payload.roleId, "roleId", errors);
  validateRequiredString(payload.userId, "userId", errors);
  validateRequiredString(payload.assignedBy, "assignedBy", errors);
  validateDate(payload.assignedAt, "assignedAt", errors);

  return { valid: errors.length === 0, errors };
}

function createRoleAssignment(payload = {}) {
  const assignment = {
    id: payload.id,
    orgId: payload.orgId,
    roleId: payload.roleId,
    userId: payload.userId,
    assignedBy: payload.assignedBy,
    assignedAt: payload.assignedAt || new Date().toISOString()
  };

  ensureValid(validateRoleAssignment(assignment));

  return assignment;
}

module.exports = {
  createRoleAssignment,
  validateRoleAssignment
};
